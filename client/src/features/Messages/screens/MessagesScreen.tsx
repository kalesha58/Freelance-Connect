import React, { useEffect } from "react";
import {
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    StatusBar,
    Image,
    ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useApp } from "@/context/AppContext";
import { useFirebase } from "@/context/FirebaseContext";
import { useColors } from "@/hooks/useColors";

/**
 * Formats a ms timestamp into a human-readable relative time string.
 */
function formatTime(ms: number): string {
    if (!ms) return "—";
    const date = new Date(ms);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

interface ConversationItemProps {
    participantId: string;
    participantName: string;
    participantAvatar?: string;
    lastMessage: string;
    lastMessageTime: number;
    unreadCount: number;
    isOnline: boolean;
    onPress: () => void;
}

function ConversationItem({
    participantId,
    participantName,
    participantAvatar,
    lastMessage,
    lastMessageTime,
    unreadCount,
    isOnline,
    onPress,
}: ConversationItemProps) {
    const colors = useColors();

    return (
        <TouchableOpacity
            style={[styles.convoSurface, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={onPress}
            activeOpacity={0.85}
        >
            <View style={styles.avatarContainer}>
                <View style={[styles.participantAvatar, { backgroundColor: colors.headerBackground }]}>
                    {participantAvatar ? (
                        <Image source={{ uri: participantAvatar }} style={styles.avatarImg} />
                    ) : (
                        <Text style={styles.avatarLabel}>{participantName.charAt(0).toUpperCase()}</Text>
                    )}
                </View>
                {isOnline && (
                    <View style={[styles.onlineDot, { backgroundColor: colors.success, borderColor: colors.card }]} />
                )}
            </View>

            <View style={styles.convoContent}>
                <View style={styles.convoHeadingRow}>
                    <Text style={[styles.participantNameText, { color: colors.foreground }]}>{participantName}</Text>
                    <Text style={[styles.timestampLabel, { color: colors.mutedForeground }]}>
                        {formatTime(lastMessageTime)}
                    </Text>
                </View>
                <View style={styles.convoPreviewRow}>
                    <Text
                        style={[
                            styles.lastMsgCopy,
                            {
                                color: unreadCount > 0 ? colors.foreground : colors.mutedForeground,
                                fontWeight: unreadCount > 0 ? "600" : "400",
                            },
                        ]}
                        numberOfLines={1}
                    >
                        {lastMessage || "Tap to start chatting"}
                    </Text>
                    {unreadCount > 0 ? (
                        <View style={[styles.unreadBadge, { backgroundColor: colors.headerBackground }]}>
                            <Text style={styles.unreadCountLabel}>{unreadCount}</Text>
                        </View>
                    ) : (
                        <Ionicons name="checkmark-done" size={16} color={colors.primary} />
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

/**
 * MessagesScreen — shows real-time Firebase conversations.
 */
export default function MessagesScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { user } = useApp();
    const { conversations, onlineUsers } = useFirebase();

    const topInsetOffset = Platform.OS === "ios" ? insets.top : 20;

    const ListHeader = () => (
        <View style={styles.headerArea}>
            <StatusBar barStyle="light-content" backgroundColor={colors.headerBackground} />
            <View style={[styles.headerSolid, { backgroundColor: colors.headerBackground, paddingTop: topInsetOffset + 12 }]}>
                <View style={styles.titleBar}>
                    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 12 }}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingBottom: 5 }}>
                            <Feather name="arrow-left" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View>
                            <Text style={[styles.brandSubtitle, { color: "rgba(255,255,255,0.7)" }]}>Connect &</Text>
                            <Text style={[styles.brandTitle, { color: "#fff" }]}>Messages</Text>
                        </View>
                    </View>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity
                            style={[styles.iconBox, { backgroundColor: "rgba(255,255,255,0.15)" }]}
                            onPress={() => navigation.navigate("NewChat")}
                        >
                            <Ionicons name="create-outline" size={22} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.iconBox, { backgroundColor: "rgba(255,255,255,0.15)" }]}
                            onPress={() => navigation.navigate("MessageSettings")}
                        >
                            <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.overlapSection}>
                <TouchableOpacity
                    style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate("SearchMessages")}
                >
                    <Feather name="search" size={18} color={colors.mutedForeground} />
                    <Text style={[styles.searchPlaceholder, { color: colors.mutedForeground }]}>
                        Search conversations...
                    </Text>
                    <View style={[styles.filterIndicator, { backgroundColor: colors.primary + "15" }]}>
                        <Ionicons name="options-outline" size={16} color={colors.primary} />
                    </View>
                </TouchableOpacity>

                <View style={styles.listSubHeadingRow}>
                    <Text style={[styles.listSubHeading, { color: colors.foreground }]}>Recent Chats</Text>
                    <Text style={[styles.countLabel, { color: colors.mutedForeground }]}>
                        {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
                    </Text>
                </View>
            </View>
        </View>
    );

    if (!user) return null;

    return (
        <View style={[styles.messagesRoot, { backgroundColor: colors.background }]}>
            <FlatList
                data={conversations}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={ListHeader}
                renderItem={({ item }) => {
                    const otherParticipantId = item.participants.find(id => id !== user._id) ?? "";
                    const isOnline = !!onlineUsers[otherParticipantId];
                    const unread = item.unreadCounts?.[user._id] ?? 0;
                    const participantName = item.participantNames?.[otherParticipantId] ?? "User";
                    const participantAvatar = item.participantAvatars?.[otherParticipantId];

                    return (
                        <View style={styles.convoWrapper}>
                            <ConversationItem
                                participantId={otherParticipantId}
                                participantName={participantName}
                                participantAvatar={participantAvatar}
                                lastMessage={item.lastMessage}
                                lastMessageTime={item.lastMessageTime}
                                unreadCount={unread}
                                isOnline={isOnline}
                                onPress={() =>
                                    navigation.navigate("Chat", {
                                        conversationId: item.id,
                                        participantId: otherParticipantId,
                                        participantName,
                                        participantAvatar,
                                    })
                                }
                            />
                        </View>
                    );
                }}
                contentContainerStyle={[styles.messagesListPadding, { paddingBottom: 100 }]}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                    <View style={styles.emptyBox}>
                        <Ionicons name="chatbubbles-outline" size={52} color={colors.mutedForeground} />
                        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No messages yet</Text>
                        <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
                            Start a conversation by tapping the compose icon
                        </Text>
                        <TouchableOpacity
                            style={[styles.newChatBtn, { backgroundColor: colors.headerBackground }]}
                            onPress={() => navigation.navigate("NewChat")}
                        >
                            <Ionicons name="create-outline" size={18} color="#fff" />
                            <Text style={styles.newChatBtnText}>New Message</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    messagesRoot: { flex: 1 },
    messagesListPadding: { paddingBottom: 20 },
    convoWrapper: { paddingHorizontal: 16 },
    headerArea: { marginBottom: 12 },
    headerSolid: {
        width: "100%",
        paddingBottom: 40,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    titleBar: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    brandSubtitle: { fontSize: 13, fontWeight: "500", marginBottom: 2 },
    brandTitle: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
    headerIcons: { flexDirection: "row", gap: 10, alignItems: "center" },
    iconBox: {
        width: 42,
        height: 42,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    overlapSection: { paddingHorizontal: 16, marginTop: -30 },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 16,
        borderWidth: 1.5,
        paddingHorizontal: 16,
        height: 56,
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 15,
        elevation: 6,
        marginBottom: 20,
    },
    searchPlaceholder: { flex: 1, fontSize: 16, fontWeight: "400" },
    filterIndicator: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    listSubHeadingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
    },
    listSubHeading: { fontSize: 18, fontWeight: "700" },
    countLabel: { fontSize: 13, fontWeight: "500" },
    convoSurface: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 20,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
        elevation: 1,
    },
    avatarContainer: { position: "relative" },
    participantAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    avatarImg: { width: "100%", height: "100%" },
    avatarLabel: { color: "#fff", fontSize: 20, fontWeight: "700" },
    onlineDot: {
        position: "absolute",
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2.5,
    },
    convoContent: { flex: 1 },
    convoHeadingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    participantNameText: { fontSize: 16, fontWeight: "700" },
    timestampLabel: { fontSize: 11, fontWeight: "500" },
    convoPreviewRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    lastMsgCopy: { flex: 1, fontSize: 13, marginRight: 10 },
    unreadBadge: {
        minWidth: 22,
        height: 22,
        borderRadius: 11,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 6,
    },
    unreadCountLabel: { color: "#fff", fontSize: 10, fontWeight: "800" },
    emptyBox: { alignItems: "center", paddingTop: 60, paddingHorizontal: 32, gap: 12 },
    emptyTitle: { fontSize: 20, fontWeight: "700", marginTop: 8 },
    emptyDesc: { fontSize: 14, fontWeight: "400", textAlign: "center", lineHeight: 20 },
    newChatBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 16,
        marginTop: 8,
    },
    newChatBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
