import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { getApp, getApps, initializeApp } from '@react-native-firebase/app';
import { 
    getFirestore, 
    collection, 
    doc, 
    query, 
    where, 
    orderBy, 
    onSnapshot, 
    addDoc, 
    setDoc, 
    updateDoc, 
    writeBatch, 
    FieldValue,
    getDocs
} from '@react-native-firebase/firestore';
import { 
    getDatabase, 
    ref, 
    onValue, 
    set, 
    onDisconnect, 
    ServerValue 
} from '@react-native-firebase/database';

// React Native Firebase usually auto-initializes the '[DEFAULT]' app 
// from GoogleService-Info.plist / google-services.json via native code.
// We check for its existence before making Firebase calls.
const isAppInitialized = getApps().length > 0;
if (!isAppInitialized) {
    console.log('[Firebase] Default app not found yet. Ensure native initialization is configured.');
}

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface FirebaseMessage {
    id: string;
    senderId: string;
    text: string;
    createdAt: number; // ms timestamp
    read: boolean;
}

export interface FirebaseConversation {
    id: string;                                 // "<uid1>_<uid2>" (sorted)
    participants: string[];                     // [uid1, uid2]
    lastMessage: string;
    lastMessageTime: number;                    // ms timestamp
    unreadCounts: Record<string, number>;       // { uid: count }
    /** Participant display names keyed by userId */
    participantNames?: Record<string, string>;
    /** Participant avatar URLs keyed by userId */
    participantAvatars?: Record<string, string>;
}

interface FirebaseContextType {
    // Conversations
    conversations: FirebaseConversation[];
    // Messages
    getMessages: (conversationId: string, onUpdate: (msgs: FirebaseMessage[]) => void) => () => void;
    // Send
    sendMessage: (
        senderId: string,
        receiverId: string,
        text: string,
        senderName?: string,
        senderAvatar?: string,
        receiverName?: string,
        receiverAvatar?: string
    ) => Promise<string>;
    // Online
    setOnline: (userId: string) => void;
    setOffline: (userId: string) => void;
    onlineUsers: Record<string, boolean>;
    // Typing
    setTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
    getTypingStatus: (conversationId: string, otherUserId: string, onUpdate: (isTyping: boolean) => void) => () => void;
    // Mark read
    markConversationRead: (conversationId: string, userId: string) => Promise<void>;
    // Subscribe to a single user's conversations (call with current user id)
    subscribeToConversations: (userId: string) => void;
}

const FirebaseContext = createContext<FirebaseContextType | null>(null);

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/** Deterministic conversation ID — sorted join of both participant IDs */
export function buildConversationId(uid1: string, uid2: string): string {
    return [uid1, uid2].sort().join('_');
}

// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────

export function FirebaseProvider({ children, currentUserId }: { children: React.ReactNode; currentUserId: string | null }) {
    const [conversations, setConversations] = useState<FirebaseConversation[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
    const convoUnsubRef = useRef<(() => void) | null>(null);

    const [isFirebaseReady, setIsFirebaseReady] = useState(false);

    // Instances
    const dbRef = useRef<any>(null);
    const rtdbRef = useRef<any>(null);

    // ── Pre-flight check ──────────────────────────────────────
    useEffect(() => {
        try {
            if (getApps().length > 0) {
                dbRef.current = getFirestore();
                rtdbRef.current = getDatabase();
                setIsFirebaseReady(true);
            } else {
                console.log('[Firebase] App not ready yet in Provider...');
            }
        } catch (err) {
            console.error('[Firebase] Provider init error:', err);
        }
    }, []);

    const db = dbRef.current;
    const rtdb = rtdbRef.current;

    // ── Subscribe to this user's conversations ────────────────
    const subscribeToConversations = useCallback((userId: string) => {
        if (!isFirebaseReady || !db) return;
        // Unsubscribe previous listener first
        if (convoUnsubRef.current) {
            convoUnsubRef.current();
            convoUnsubRef.current = null;
        }

        if (!userId) return;

        const convosQuery = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', userId),
            orderBy('lastMessageTime', 'desc')
        );

        const unsub = onSnapshot(convosQuery, snapshot => {
            const convos: FirebaseConversation[] = snapshot.docs.map(docSnapshot => ({
                id: docSnapshot.id,
                ...(docSnapshot.data() as Omit<FirebaseConversation, 'id'>),
            }));
            setConversations(convos);
        }, err => {
            console.error('[Firebase] conversations snapshot error:', err);
        });

        convoUnsubRef.current = unsub;
    }, [db]);

    // Resubscribe when the current user changes (login/logout)
    useEffect(() => {
        if (currentUserId) {
            subscribeToConversations(currentUserId);
        } else {
            // Signed out — clear
            if (convoUnsubRef.current) convoUnsubRef.current();
            convoUnsubRef.current = null;
            setConversations([]);
            setOnlineUsers({});
        }
    }, [currentUserId, subscribeToConversations]);

    // ── Real-time messages for a single conversation ──────────
    const getMessages = useCallback((conversationId: string, onUpdate: (msgs: FirebaseMessage[]) => void) => {
        const messagesQuery = query(
            collection(doc(db, 'conversations', conversationId), 'messages'),
            orderBy('createdAt', 'asc')
        );

        const unsub = onSnapshot(messagesQuery, snapshot => {
            const msgs: FirebaseMessage[] = snapshot.docs.map(docSnapshot => ({
                id: docSnapshot.id,
                ...(docSnapshot.data() as Omit<FirebaseMessage, 'id'>),
            }));
            onUpdate(msgs);
        }, err => {
            console.error('[Firebase] messages snapshot error:', err);
        });
        return unsub;
    }, [db]);

    // ── Send a message ────────────────────────────────────────
    const sendMessage = useCallback(async (
        senderId: string,
        receiverId: string,
        text: string,
        senderName?: string,
        senderAvatar?: string,
        receiverName?: string,
        receiverAvatar?: string
    ): Promise<string> => {
        const convId = buildConversationId(senderId, receiverId);
        const convRef = doc(db, 'conversations', convId);
        const now = Date.now();

        // Build metadata maps for participant names & avatars
        const participantNames: Record<string, string> = {};
        const participantAvatars: Record<string, string> = {};
        if (senderName) participantNames[senderId] = senderName;
        if (senderAvatar) participantAvatars[senderId] = senderAvatar;
        if (receiverName) participantNames[receiverId] = receiverName;
        if (receiverAvatar) participantAvatars[receiverId] = receiverAvatar;

        // Upsert conversation doc
        await setDoc(
            convRef,
            {
                participants: [senderId, receiverId],
                lastMessage: text || '',
                lastMessageTime: now,
                ...(Object.keys(participantNames).length > 0 && { participantNames }),
                ...(Object.keys(participantAvatars).length > 0 && { participantAvatars }),
                [`unreadCounts.${receiverId}`]: FieldValue.increment(text ? 1 : 0),
            },
            { merge: true }
        );

        // Add message to subcollection (only if there is actual text)
        if (text.trim()) {
            await addDoc(collection(convRef, 'messages'), {
                senderId,
                text: text.trim(),
                createdAt: now,
                read: false,
            });
        }

        return convId;
    }, [db]);

    // ── Mark conversation as read ─────────────────────────────
    const markConversationRead = useCallback(async (conversationId: string, userId: string) => {
        try {
            const convRef = doc(db, 'conversations', conversationId);
            await updateDoc(convRef, { [`unreadCounts.${userId}`]: 0 });

            // Mark individual messages as read
            const messagesRef = collection(convRef, 'messages');
            const unreadQuery = query(
                messagesRef,
                where('read', '==', false),
                where('senderId', '!=', userId)
            );
            
            const unreadSnap = await getDocs(unreadQuery);

            const batch = writeBatch(db);
            unreadSnap.docs.forEach(docSnapshot => batch.update(docSnapshot.ref, { read: true }));
            await batch.commit();
        } catch (err) {
            console.error('[Firebase] markRead error:', err);
        }
    }, [db]);

    // ── Online Presence (Realtime Database) ───────────────────
    const setOnline = useCallback((userId: string) => {
        if (!userId) return;
        const userStatusRef = ref(rtdb, `/status/${userId}`);
        const connectedRef = ref(rtdb, '.info/connected');

        onValue(connectedRef, snapshot => {
            if (!snapshot.val()) return;

            onDisconnect(userStatusRef).set({
                online: false,
                lastSeen: ServerValue.TIMESTAMP,
            }).then(() => {
                set(userStatusRef, {
                    online: true,
                    lastSeen: ServerValue.TIMESTAMP,
                });
            });
        });
    }, [rtdb]);

    const setOffline = useCallback((userId: string) => {
        if (!userId) return;
        set(ref(rtdb, `/status/${userId}`), { 
            online: false, 
            lastSeen: ServerValue.TIMESTAMP 
        });
    }, [rtdb]);

    // ── Watch a specific user's online status ─────────────────
    const watchOnlineStatus = useCallback((userId: string) => {
        if (!userId || onlineUsers[userId] !== undefined) return;

        const userStatusRef = ref(rtdb, `/status/${userId}`);
        onValue(userStatusRef, snapshot => {
            const val = snapshot.val();
            setOnlineUsers(prev => ({
                ...prev,
                [userId]: val?.online === true,
            }));
        });
    }, [rtdb, onlineUsers]);

    // Watch online status for all conversation participants
    useEffect(() => {
        conversations.forEach(conv => {
            conv.participants.forEach(uid => {
                if (uid !== currentUserId) watchOnlineStatus(uid);
            });
        });
    }, [conversations, currentUserId, watchOnlineStatus]);

    // ── Typing Indicators (Realtime Database) ─────────────────
    const setTyping = useCallback((conversationId: string, userId: string, isTyping: boolean) => {
        set(ref(rtdb, `/typing/${conversationId}/${userId}`), isTyping);
    }, [rtdb]);

    const getTypingStatus = useCallback(
        (conversationId: string, otherUserId: string, onUpdate: (isTyping: boolean) => void) => {
            const typingRef = ref(rtdb, `/typing/${conversationId}/${otherUserId}`);
            return onValue(typingRef, snapshot => {
                onUpdate(!!snapshot.val());
            });
        },
        [rtdb]
    );

    return (
        <FirebaseContext.Provider
            value={{
                conversations,
                getMessages,
                sendMessage,
                setOnline,
                setOffline,
                onlineUsers,
                setTyping,
                getTypingStatus,
                markConversationRead,
                subscribeToConversations,
            }}
        >
            {children}
        </FirebaseContext.Provider>
    );
}

export function useFirebase() {
    const ctx = useContext(FirebaseContext);
    if (!ctx) throw new Error('useFirebase must be used within FirebaseProvider');
    return ctx;
}
