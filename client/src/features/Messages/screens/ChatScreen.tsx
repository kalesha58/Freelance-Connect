import React, { useEffect, useRef, useState } from "react";
import {
    FlatList,
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

import { IConversation } from "./MessagesScreen";
import { useApp } from "@/context/AppContext";
import { formatSafeTime } from "@/utils/formatRelativeTime";
import { useColors } from "@/hooks/useColors";

/**
 * Type definition for Chat route parameters.
 */
type ChatRouteProp = RouteProp<{ Chat: { id: string } }, 'Chat'>;

/**
 * Interface defining a single chat message.
 */
export interface IMessage {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
}

/**
 * ChatScreen provides a real-time messaging interface for users.
 * Optimized for React Native CLI with native keyboard handling and premium UI components.
 */
export default function ChatScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const route = useRoute<ChatRouteProp>();
    const { id } = route.params || {};

    const { user, conversations, fetchMessages, sendMessage } = useApp();
    const [text, setText] = useState("");
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const flatRef = useRef<FlatList>(null);

    // Find current conversation from global state
    const currentConvo = conversations.find(c => c._id === id);
    const otherParticipant = currentConvo?.participants.find((p: any) => p._id !== user?._id);

    const topPaddingOffset = Platform.OS === "ios" ? insets.top : 20;
    const bottomPaddingOffset = Platform.OS === "ios" ? insets.bottom : 20;

    useEffect(() => {
        loadMessages();
    }, [id]);

    const loadMessages = async () => {
        if (!id) return;
        try {
            const data = await fetchMessages(id);
            // Map backend messages to IMessage
            const formatted = data.map((m: any) => ({
                id: m._id,
                senderId: m.senderId === user?._id ? "me" : "other",
                text: m.text,
                timestamp: formatSafeTime(m.createdAt) || "—"
            }));
            setMessages(formatted);
            setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 200);
        } catch (error) {
            console.error("Load Messages Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        if (!text.trim() || !otherParticipant) return;

        const receiverId = otherParticipant._id;
        const msgText = text.trim();
        setText("");

        try {
            await sendMessage(receiverId, msgText);
            loadMessages(); // Refresh messages
        } catch (error) {
            console.error("Send Message Error:", error);
        }
    };

    const renderMessage = ({ item }: { item: IMessage }) => {
        const isMe = item.senderId === "me";
        return (
            <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
                {!isMe && (
                    <View style={[styles.authorAvatar, { backgroundColor: colors.headerBackground }]}>
                        <Text style={styles.authorAvatarLabel}>{otherParticipant?.name?.charAt(0) || "?"}</Text>
                    </View>
                )}
                <View style={[
                    styles.textBubble,
                    isMe
                        ? { backgroundColor: colors.headerBackground }
                        : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
                ]}>
                    <Text style={[styles.bubbleCopy, { color: isMe ? "#fff" : colors.foreground }]}>{item.text}</Text>
                    <Text style={[styles.bubbleTimeLabel, { color: isMe ? "rgba(255,255,255,0.6)" : colors.mutedForeground }]}>{item.timestamp}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.chatViewRoot, { backgroundColor: colors.background }]}>
            <View style={[styles.chatHeaderRow, { paddingTop: topPaddingOffset + 6, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={22} color={colors.foreground} />
                </TouchableOpacity>
                <View style={[styles.headerAvatarCircle, { backgroundColor: colors.headerBackground }]}>
                    <Text style={styles.headerAvatarLabel}>{otherParticipant?.name?.charAt(0) || "?"}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.headerParticipantName, { color: colors.foreground }]}>{otherParticipant?.name || "Chat"}</Text>
                    <Text style={[styles.headerPresenceStatus, { color: colors.success }]}>Online</Text>
                </View>
                <TouchableOpacity>
                    <Feather name="more-vertical" size={22} color={colors.foreground} />
                </TouchableOpacity>
            </View>

            {currentConvo?.isLocked ? (
                <View style={styles.lockedStateView}>
                    <View style={[styles.upgradeCardSurface, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[styles.lockIconBox, { backgroundColor: colors.warning + "18" }]}>
                            <Ionicons name="lock-closed" size={36} color={colors.warning} />
                        </View>
                        <Text style={[styles.lockedTitleLabel, { color: colors.foreground }]}>Chat Locked</Text>
                        <Text style={[styles.lockedDescText, { color: colors.mutedForeground }]}>
                            You've reached your free chat limit. Upgrade to Pro to unlock unlimited conversations with clients.
                        </Text>
                        <TouchableOpacity
                            style={[styles.premiumUnlockBtn, { backgroundColor: colors.navyDeep }]}
                            onPress={() => { }}
                        >
                            <Ionicons name="lock-open" size={16} color="#fff" />
                            <Text style={styles.premiumUnlockBtnLabel}>Unlock for $4.99/month</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <>
                    <FlatList
                        ref={flatRef}
                        data={messages}
                        keyExtractor={(item) => item.id}
                        renderItem={renderMessage}
                        contentContainerStyle={[styles.messagesListContent, { paddingBottom: 16 }]}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyConversationBox}>
                                <Text style={[styles.emptyConversationMsg, { color: colors.mutedForeground }]}>Start the conversation!</Text>
                            </View>
                        )}
                    />

                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
                    >
                        <View style={[styles.chatInputBar, {
                            backgroundColor: colors.card,
                            borderTopColor: colors.border,
                            paddingBottom: bottomPaddingOffset + 8,
                        }]}>
                            <TouchableOpacity style={styles.attachmentActionBtn}>
                                <Feather name="paperclip" size={20} color={colors.mutedForeground} />
                            </TouchableOpacity>
                            <View style={[styles.chatInputFieldBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                <TextInput
                                    style={[styles.chatInputText, { color: colors.foreground }]}
                                    placeholder="Type a message..."
                                    placeholderTextColor={colors.mutedForeground}
                                    value={text}
                                    onChangeText={setText}
                                    multiline
                                    maxLength={500}
                                />
                            </View>
                            <TouchableOpacity
                                style={[styles.messageSendBtn, { backgroundColor: text.trim() ? colors.buttonPrimary : colors.muted }]}
                                onPress={handleSend}
                                disabled={!text.trim()}
                            >
                                <Feather name="send" size={18} color={text.trim() ? colors.onButtonPrimary : colors.mutedForeground} />
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </>
            )}
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
    },
    headerAvatarLabel: { color: "#fff", fontSize: 16, fontWeight: '700' },
    headerParticipantName: { fontSize: 15, fontWeight: '700' },
    headerPresenceStatus: { fontSize: 11, fontWeight: '400' },
    messagesListContent: { padding: 16, gap: 12 },
    messageRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 12 },
    messageRowMe: { flexDirection: "row-reverse" },
    authorAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    authorAvatarLabel: { color: "#fff", fontSize: 12, fontWeight: '700' },
    textBubble: { maxWidth: "75%", borderRadius: 18, padding: 12, gap: 4 },
    bubbleCopy: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
    bubbleTimeLabel: { fontSize: 10, fontWeight: '400', alignSelf: "flex-end" },
    lockedStateView: { flex: 1, padding: 20, justifyContent: "center" },
    upgradeCardSurface: { borderRadius: 24, padding: 24, borderWidth: 1, alignItems: "center", gap: 12 },
    lockIconBox: { width: 72, height: 72, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 4 },
    lockedTitleLabel: { fontSize: 22, fontWeight: '700' },
    lockedDescText: { fontSize: 13, fontWeight: '400', textAlign: "center", lineHeight: 20 },
    upsellFeaturesList: { width: "100%", gap: 8 },
    upsellFeatureItem: { flexDirection: "row", alignItems: "center", gap: 8 },
    upsellFeatureLabel: { fontSize: 13, fontWeight: '500' },
    premiumUnlockBtn: { flexDirection: "row", alignItems: "center", gap: 8, width: "100%", justifyContent: "center", borderRadius: 16, paddingVertical: 15, marginTop: 4 },
    premiumUnlockBtnLabel: { color: "#fff", fontSize: 15, fontWeight: '700' },
    freeUnlockTrigger: { fontSize: 13, fontWeight: '500' },
    emptyConversationBox: { alignItems: "center", paddingTop: 40 },
    emptyConversationMsg: { fontSize: 14, fontWeight: '400' },
    chatInputBar: { flexDirection: "row", alignItems: "flex-end", padding: 12, borderTopWidth: 1, gap: 8 },
    attachmentActionBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    chatInputFieldBox: { flex: 1, borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, maxHeight: 100 },
    chatInputText: { fontSize: 15, fontWeight: '400' },
    messageSendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
});
