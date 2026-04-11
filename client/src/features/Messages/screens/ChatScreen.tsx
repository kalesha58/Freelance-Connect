import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useApp } from "@/context/AppContext";
import { useFirebase, FirebaseMessage } from "@/context/FirebaseContext";
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
                            name={message.read ? "checkmark-done" : "checkmark"}
                            size={12}
                            color={message.read ? "#4ade80" : "rgba(255,255,255,0.6)"}
                            style={{ marginLeft: 4 }}
                        />
                    )}
                </View>
            </View>
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
    const { getMessages, sendMessage, setTyping, getTypingStatus, markConversationRead, onlineUsers } = useFirebase();

    const [messages, setMessages] = useState<FirebaseMessage[]>([]);
    const [text, setText] = useState("");
    const [isOtherTyping, setIsOtherTyping] = useState(false);
    const flatRef = useRef<FlatList>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const topPaddingOffset = Platform.OS === "ios" ? insets.top : 20;
    const bottomPaddingOffset = Platform.OS === "ios" ? insets.bottom : 20;

    const displayName = participantName || "Chat";
    const participantInitial = displayName.charAt(0).toUpperCase();
    const isOnline = !!onlineUsers[participantId];

    // ── Subscribe to messages ─────────────────────────────────
    useEffect(() => {
        if (!conversationId) return;

        const unsubscribe = getMessages(conversationId, (msgs) => {
            setMessages(msgs);
            // Scroll to bottom on new message
            setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
        });

        // Mark as read when opening
        if (user?._id) {
            markConversationRead(conversationId, user._id);
        }

        return unsubscribe;
    }, [conversationId, user?._id]);

    // ── Subscribe to partner's typing status ──────────────────
    useEffect(() => {
        if (!conversationId || !participantId) return;
        const unsubscribe = getTypingStatus(conversationId, participantId, setIsOtherTyping);
        return unsubscribe;
    }, [conversationId, participantId]);

    // ── Handle text input & typing events ────────────────────
    const handleTextChange = useCallback((value: string) => {
        setText(value);
        if (!conversationId || !user?._id) return;

        // Emit typing: true
        setTyping(conversationId, user._id, true);

        // Clear previous debounce
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        // Emit typing: false after 1.5s of no input
        typingTimeoutRef.current = setTimeout(() => {
            setTyping(conversationId, user._id, false);
        }, 1500);
    }, [conversationId, user?._id, setTyping]);

    // Clear typing on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            if (conversationId && user?._id) setTyping(conversationId, user._id, false);
        };
    }, [conversationId, user?._id]);

    // ── Send message ──────────────────────────────────────────
    const handleSend = useCallback(async () => {
        if (!text.trim() || !user?._id || !participantId) return;

        const msgText = text.trim();
        setText("");

        // Clear typing indicator
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        setTyping(conversationId, user._id, false);

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
    }, [text, user?._id, participantId, conversationId, sendMessage, setTyping, user?.name, user?.avatar, user?.profilePic, participantName, participantAvatar]);

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
                        <Text style={[styles.headerPresenceStatus, { color: colors.primary }]}>
                            typing...
                        </Text>
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
