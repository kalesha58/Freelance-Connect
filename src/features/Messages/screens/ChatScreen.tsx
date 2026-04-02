import React, { useRef, useState } from "react";
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

    // Using a mock conversation structure as it's not fully defined in AppContext yet
    const { user } = useApp();
    const [text, setText] = useState("");
    const flatRef = useRef<FlatList>(null);

    // Mock conversation data for demonstration
    const [convo, setConvo] = useState<IConversation & { messages: IMessage[] }>({
        id: id || "1",
        participantName: "Sarah Chen",
        lastMessage: "",
        lastMessageTime: "",
        unreadCount: 0,
        isLocked: id === "3", // Emulating locked chat for the third mock ID
        messages: [
            { id: "1", senderId: "other", text: "Hey! I saw your profile and love your UI work.", timestamp: "10:05 AM" },
            { id: "2", senderId: "me", text: "Thanks Sarah! I'd love to chat about your project.", timestamp: "10:10 AM" },
            { id: "3", senderId: "other", text: "Are you available for a 3-month contract starting next week?", timestamp: "10:12 AM" },
        ]
    });

    const topPaddingOffset = Platform.OS === "ios" ? insets.top : 20;
    const bottomPaddingOffset = Platform.OS === "ios" ? insets.bottom : 20;

    const handleSend = () => {
        if (!text.trim()) return;

        const newMessage: IMessage = {
            id: Date.now().toString(),
            senderId: "me",
            text: text.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setConvo(prev => ({
            ...prev,
            messages: [...prev.messages, newMessage]
        }));

        setText("");
        setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    };

    const renderMessage = ({ item }: { item: IMessage }) => {
        const isMe = item.senderId === "me";
        return (
            <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
                {!isMe && (
                    <View style={[styles.authorAvatar, { backgroundColor: colors.primary }]}>
                        <Text style={styles.authorAvatarLabel}>{convo.participantName.charAt(0)}</Text>
                    </View>
                )}
                <View style={[
                    styles.textBubble,
                    isMe
                        ? { backgroundColor: colors.primary }
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
                <View style={[styles.headerAvatarCircle, { backgroundColor: colors.primary }]}>
                    <Text style={styles.headerAvatarLabel}>{convo.participantName.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.headerParticipantName, { color: colors.foreground }]}>{convo.participantName}</Text>
                    <Text style={[styles.headerPresenceStatus, { color: colors.success }]}>Online</Text>
                </View>
                <TouchableOpacity>
                    <Feather name="more-vertical" size={22} color={colors.foreground} />
                </TouchableOpacity>
            </View>

            {convo.isLocked ? (
                <View style={styles.lockedStateView}>
                    <View style={[styles.upgradeCardSurface, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[styles.lockIconBox, { backgroundColor: colors.warning + "18" }]}>
                            <Ionicons name="lock-closed" size={36} color={colors.warning} />
                        </View>
                        <Text style={[styles.lockedTitleLabel, { color: colors.foreground }]}>Chat Locked</Text>
                        <Text style={[styles.lockedDescText, { color: colors.mutedForeground }]}>
                            You've reached your free chat limit. Upgrade to Pro to unlock unlimited conversations with clients.
                        </Text>
                        <View style={styles.upsellFeaturesList}>
                            {["Unlimited client chats", "Priority responses", "Read receipts", "File attachments"].map(feat => (
                                <View key={feat} style={styles.upsellFeatureItem}>
                                    <Feather name="check-circle" size={15} color={colors.success} />
                                    <Text style={[styles.upsellFeatureLabel, { color: colors.mutedForeground }]}>{feat}</Text>
                                </View>
                            ))}
                        </View>
                        <TouchableOpacity
                            style={[styles.premiumUnlockBtn, { backgroundColor: colors.navyDeep }]}
                            onPress={() => { }}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="lock-open" size={16} color="#fff" />
                            <Text style={styles.premiumUnlockBtnLabel}>Unlock for $4.99/month</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { }}>
                            <Text style={[styles.freeUnlockTrigger, { color: colors.primary }]}>Use 1 free unlock</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <>
                    <FlatList
                        ref={flatRef}
                        data={convo.messages}
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
                                style={[styles.messageSendBtn, { backgroundColor: text.trim() ? colors.primary : colors.muted }]}
                                onPress={handleSend}
                                disabled={!text.trim()}
                            >
                                <Feather name="send" size={18} color={text.trim() ? "#fff" : colors.mutedForeground} />
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
