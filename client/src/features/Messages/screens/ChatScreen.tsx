import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    FlatList,
    Image,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useApp } from "@/context/AppContext";
import { useFirebase, FirebaseMessage, buildConversationId } from "@/context/FirebaseContext";
import { useColors } from "@/hooks/useColors";

// ─────────────────────────────────────────────────────────────
// Route type
// ─────────────────────────────────────────────────────────────
type ChatRouteProp = RouteProp<
    {
        Chat: {
            conversationId: string;
            participantId: string;
            participantName?: string;
            participantAvatar?: string;
        };
    },
    "Chat"
>;

// ─────────────────────────────────────────────────────────────
// Message bubble component
// ─────────────────────────────────────────────────────────────
function MessageBubble({
    message,
    isMe,
    participantInitial,
    colors,
}: {
    message: FirebaseMessage;
    isMe: boolean;
    participantInitial: string;
    colors: any;
}) {
    const time = new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
            {!isMe && (
                <View style={[styles.authorAvatar, { backgroundColor: colors.headerBackground }]}>
                    <Text style={styles.authorAvatarLabel}>{participantInitial}</Text>
                </View>
            )}
            <View
                style={[
                    styles.textBubble,
                    isMe
                        ? { backgroundColor: colors.headerBackground }
                        : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
                ]}
            >
                <Text style={[styles.bubbleCopy, { color: isMe ? "#fff" : colors.foreground }]}>
                    {message.text}
                </Text>
                <View style={styles.bubbleFooter}>
                    <Text style={[styles.bubbleTimeLabel, { color: isMe ? "rgba(255,255,255,0.6)" : colors.mutedForeground }]}>
                        {time}
                    </Text>
                    {isMe && (
                        <Ionicons
                            name="checkmark-done"
                            size={12}
                            color={message.read ? colors.success : "rgba(255,255,255,0.6)"}
                            style={{ marginLeft: 4 }}
                        />
                    )}
                </View>
            </View>
        </View>
    );
}

/** Animated “…” for typing — three dots with staggered bounce. */
function TypingDots({ color, dotSize = 5 }: { color: string; dotSize?: number }) {
    const a = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;

    useEffect(() => {
        const makeLoop = (v: Animated.Value, delayMs: number) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delayMs),
                    Animated.timing(v, {
                        toValue: 1,
                        duration: 280,
                        useNativeDriver: true,
                    }),
                    Animated.timing(v, {
                        toValue: 0,
                        duration: 280,
                        useNativeDriver: true,
                    }),
                ]),
            );
        const l0 = makeLoop(a[0], 0);
        const l1 = makeLoop(a[1], 120);
        const l2 = makeLoop(a[2], 240);
        l0.start();
        l1.start();
        l2.start();
        return () => {
            l0.stop();
            l1.stop();
            l2.stop();
        };
    }, [a]);

    return (
        <View style={styles.typingDotsRow}>
            {a.map((v, i) => (
                <Animated.View
                    key={i}
                    style={{
                        width: dotSize,
                        height: dotSize,
                        borderRadius: dotSize / 2,
                        backgroundColor: color,
                        marginHorizontal: 2,
                        opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
                        transform: [
                            {
                                translateY: v.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, -4],
                                }),
                            },
                        ],
                    }}
                />
            ))}
        </View>
    );
}

// ─────────────────────────────────────────────────────────────
// ChatScreen
// ─────────────────────────────────────────────────────────────
export default function ChatScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const route = useRoute<ChatRouteProp>();
    const { conversationId, participantId, participantName, participantAvatar } = route.params || {};

    const { user } = useApp();
    const {
        getMessages,
        sendMessage,
        setTyping,
        getTypingStatus,
        registerTypingOnDisconnect,
        markConversationRead,
        onlineUsers,
        isFirebaseReady,
        watchUserPresence,
    } = useFirebase();

    const [messages, setMessages] = useState<FirebaseMessage[]>([]);
    const [text, setText] = useState("");
    const [isOtherTyping, setIsOtherTyping] = useState(false);
    const flatRef = useRef<FlatList>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const resolvedConversationId = useMemo(() => {
        if (user?._id && participantId) {
            return buildConversationId(user._id, participantId);
        }
        return conversationId ?? "";
    }, [user?._id, participantId, conversationId]);

    useEffect(() => {
        if (
            __DEV__ &&
            conversationId &&
            resolvedConversationId &&
            conversationId !== resolvedConversationId
        ) {
            console.warn(
                "[ChatScreen] conversationId param does not match buildConversationId; using resolved id:",
                resolvedConversationId
            );
        }
    }, [conversationId, resolvedConversationId]);

    const topPaddingOffset = Platform.OS === "ios" ? insets.top : 20;
    const bottomPaddingOffset = Platform.OS === "ios" ? insets.bottom : 20;

    const displayName = participantName || "Chat";
    const participantInitial = displayName.charAt(0).toUpperCase();
    const isOnline = !!onlineUsers[participantId];

    // ── Ensure partner presence is watched (not only via conversations list) ──
    useEffect(() => {
        if (!participantId || !isFirebaseReady) return;
        watchUserPresence(participantId);
    }, [participantId, isFirebaseReady, watchUserPresence]);

    // ── RTDB: clear our typing flag if the app disconnects ────
    useEffect(() => {
        if (!resolvedConversationId || !user?._id || !isFirebaseReady) return;
        registerTypingOnDisconnect(resolvedConversationId, user._id);
    }, [resolvedConversationId, user?._id, isFirebaseReady, registerTypingOnDisconnect]);

    // ── Subscribe to messages ─────────────────────────────────
    useEffect(() => {
        if (!resolvedConversationId) return;

        const unsubscribe = getMessages(resolvedConversationId, (msgs) => {
            setMessages(msgs);
            // Scroll to bottom on new message
            setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
        });

        // Mark as read when opening
        if (user?._id) {
            markConversationRead(resolvedConversationId, user._id);
        }

        return unsubscribe;
    }, [resolvedConversationId, user?._id, isFirebaseReady, getMessages, markConversationRead]);

    // ── Subscribe to partner's typing status ──────────────────
    useEffect(() => {
        if (!resolvedConversationId || !participantId) return;
        const unsubscribe = getTypingStatus(resolvedConversationId, participantId, setIsOtherTyping);
        return unsubscribe;
    }, [resolvedConversationId, participantId, isFirebaseReady, getTypingStatus]);

    // Scroll when partner typing row appears
    useEffect(() => {
        if (!isOtherTyping) return;
        const t = setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 80);
        return () => clearTimeout(t);
    }, [isOtherTyping]);

    // ── Handle text input & typing events ────────────────────
    const handleTextChange = useCallback((value: string) => {
        setText(value);
        if (!resolvedConversationId || !user?._id) return;

        if (value.trim() === "") {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            setTyping(resolvedConversationId, user._id, false);
            return;
        }

        setTyping(resolvedConversationId, user._id, true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setTyping(resolvedConversationId, user._id, false);
        }, 1800);
    }, [resolvedConversationId, user?._id, setTyping]);

    // Clear typing on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            if (resolvedConversationId && user?._id) setTyping(resolvedConversationId, user._id, false);
        };
    }, [resolvedConversationId, user?._id, setTyping]);

    // ── Send message ──────────────────────────────────────────
    const handleSend = useCallback(async () => {
        if (!text.trim() || !user?._id || !participantId || !resolvedConversationId) return;

        const msgText = text.trim();
        setText("");

        // Clear typing indicator
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        setTyping(resolvedConversationId, user._id, false);

        try {
            await sendMessage(
                user._id,
                participantId,
                msgText,
                user.name,
                user.avatar || user.profilePic,
                participantName,
                participantAvatar,
            );
        } catch (err) {
            console.error("[ChatScreen] sendMessage error:", err);
        }
    }, [text, user?._id, participantId, resolvedConversationId, sendMessage, setTyping, user?.name, user?.avatar, user?.profilePic, participantName, participantAvatar]);

    return (
        <View style={[styles.chatViewRoot, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.chatHeaderRow, { paddingTop: topPaddingOffset + 6, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={22} color={colors.foreground} />
                </TouchableOpacity>

                <View style={[styles.headerAvatarCircle, { backgroundColor: colors.headerBackground }]}>
                    {participantAvatar ? (
                        <Image source={{ uri: participantAvatar }} style={styles.headerAvatarImg} />
                    ) : (
                        <Text style={styles.headerAvatarLabel}>{participantInitial}</Text>
                    )}
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={[styles.headerParticipantName, { color: colors.foreground }]}>
                        {displayName}
                    </Text>
                    {isOtherTyping ? (
                        <View style={styles.headerTypingLine}>
                            <Text style={[styles.headerPresenceStatus, { color: colors.primary }]}>
                                Typing
                            </Text>
                            <TypingDots color={colors.primary} dotSize={4} />
                        </View>
                    ) : (
                        <Text style={[styles.headerPresenceStatus, { color: isOnline ? colors.success : colors.mutedForeground }]}>
                            {isOnline ? "Online" : "Offline"}
                        </Text>
                    )}
                </View>

                <TouchableOpacity>
                    <Feather name="more-vertical" size={22} color={colors.foreground} />
                </TouchableOpacity>
            </View>

            {/* Messages */}
            <FlatList
                ref={flatRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <MessageBubble
                        message={item}
                        isMe={item.senderId === user?._id}
                        participantInitial={participantInitial}
                        colors={colors}
                    />
                )}
                contentContainerStyle={[styles.messagesListContent, { paddingBottom: 16 }]}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
                ListFooterComponent={
                    isOtherTyping ? (
                        <View style={styles.typingFooterRow}>
                            <View style={[styles.typingAvatar, { backgroundColor: colors.headerBackground }]}>
                                <Text style={styles.typingAvatarLabel}>{participantInitial}</Text>
                            </View>
                            <View
                                style={[
                                    styles.typingBubble,
                                    { backgroundColor: colors.card, borderColor: colors.border },
                                ]}
                            >
                                <TypingDots color={colors.mutedForeground} dotSize={6} />
                            </View>
                        </View>
                    ) : null
                }
                ListEmptyComponent={() => (
                    <View style={styles.emptyConversationBox}>
                        <Ionicons name="chatbubbles-outline" size={48} color={colors.mutedForeground} />
                        <Text style={[styles.emptyConversationMsg, { color: colors.mutedForeground }]}>
                            Start the conversation!
                        </Text>
                        <Text style={[styles.emptyConversationSub, { color: colors.mutedForeground }]}>
                            Messages are delivered in real time
                        </Text>
                    </View>
                )}
            />

            {/* Input Bar */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={0}
            >
                <View
                    style={[
                        styles.chatInputBar,
                        {
                            backgroundColor: colors.card,
                            borderTopColor: colors.border,
                            paddingBottom: bottomPaddingOffset + 8,
                        },
                    ]}
                >
                    <TouchableOpacity style={styles.attachmentActionBtn}>
                        <Feather name="paperclip" size={20} color={colors.mutedForeground} />
                    </TouchableOpacity>

                    <View style={[styles.chatInputFieldBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <TextInput
                            style={[styles.chatInputText, { color: colors.foreground }]}
                            placeholder="Type a message..."
                            placeholderTextColor={colors.mutedForeground}
                            value={text}
                            onChangeText={handleTextChange}
                            multiline
                            maxLength={500}
                        />
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.messageSendBtn,
                            { backgroundColor: text.trim() ? colors.buttonPrimary : colors.muted },
                        ]}
                        onPress={handleSend}
                        disabled={!text.trim()}
                    >
                        <Feather
                            name="send"
                            size={18}
                            color={text.trim() ? colors.onButtonPrimary : colors.mutedForeground}
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    chatViewRoot: { flex: 1 },
    chatHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        gap: 12,
    },
    headerAvatarCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    headerAvatarImg: { width: "100%", height: "100%" },
    headerAvatarLabel: { color: "#fff", fontSize: 16, fontWeight: "700" },
    headerParticipantName: { fontSize: 15, fontWeight: "700" },
    headerPresenceStatus: { fontSize: 11, fontWeight: "400" },
    headerTypingLine: { flexDirection: "row", alignItems: "center", gap: 6 },
    typingDotsRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "center" },
    typingFooterRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 8,
        marginBottom: 8,
        paddingHorizontal: 0,
    },
    typingAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    typingAvatarLabel: { color: "#fff", fontSize: 12, fontWeight: "700" },
    typingBubble: {
        borderRadius: 18,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        minWidth: 56,
        alignItems: "center",
        justifyContent: "center",
    },
    messagesListContent: { padding: 16, gap: 12 },
    messageRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 12 },
    messageRowMe: { flexDirection: "row-reverse" },
    authorAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    authorAvatarLabel: { color: "#fff", fontSize: 12, fontWeight: "700" },
    textBubble: { maxWidth: "75%", borderRadius: 18, padding: 12 },
    bubbleCopy: { fontSize: 14, fontWeight: "400", lineHeight: 20 },
    bubbleFooter: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", marginTop: 4 },
    bubbleTimeLabel: { fontSize: 10, fontWeight: "400" },
    emptyConversationBox: { alignItems: "center", paddingTop: 60, gap: 10 },
    emptyConversationMsg: { fontSize: 16, fontWeight: "600", marginTop: 8 },
    emptyConversationSub: { fontSize: 12, fontWeight: "400" },
    chatInputBar: {
        flexDirection: "row",
        alignItems: "flex-end",
        padding: 12,
        borderTopWidth: 1,
        gap: 8,
    },
    attachmentActionBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    chatInputFieldBox: {
        flex: 1,
        borderRadius: 20,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 10,
        maxHeight: 100,
    },
    chatInputText: { fontSize: 15, fontWeight: "400" },
    messageSendBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
});
