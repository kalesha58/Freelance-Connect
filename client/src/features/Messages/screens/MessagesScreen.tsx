import React from "react";
import {
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    StatusBar,
    Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useColors } from "@/hooks/useColors";

/**
 * Interface defining a message conversation.
 */
export interface IConversation {
    id: string;
    participantName: string;
    avatar?: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    isLocked: boolean;
    isOnline?: boolean;
}

const MOCK_CONVOS: IConversation[] = [
    {
        id: "1",
        participantName: "Sarah Chen",
        avatar: "https://i.pravatar.cc/150?u=sarah",
        lastMessage: "Sounds great, I will start on the wireframes tomorrow.",
        lastMessageTime: "2h ago",
        unreadCount: 2,
        isLocked: false,
        isOnline: true
    },
    {
        id: "2",
        participantName: "Marcus Johnson",
        avatar: "https://i.pravatar.cc/150?u=marcus",
        lastMessage: "Can we hop on a quick call to discuss the milestones?",
        lastMessageTime: "5h ago",
        unreadCount: 0,
        isLocked: false,
        isOnline: false
    },
    {
        id: "3",
        participantName: "Alex Rivera",
        avatar: "https://i.pravatar.cc/150?u=alex",
        lastMessage: "Locked Conversation",
        lastMessageTime: "Yesterday",
        unreadCount: 0,
        isLocked: true
    },
];

/**
 * Renders an individual conversation item in the list.
 */
function ConversationItem({ convo, onPress }: { convo: IConversation; onPress: () => void }) {
    const colors = useColors();

    return (
        <TouchableOpacity
            style={[styles.convoSurface, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={onPress}
            activeOpacity={0.85}
        >
            <View style={styles.avatarContainer}>
                <View style={[styles.participantAvatar, { backgroundColor: convo.isLocked ? colors.muted : colors.primary }]}>
                    {convo.isLocked ? (
                        <Feather name="lock" size={18} color={colors.mutedForeground} />
                    ) : (
                        convo.avatar ? (
                            <Image source={{ uri: convo.avatar }} style={styles.avatarImg} />
                        ) : (
                            <Text style={styles.avatarLabel}>{convo.participantName.charAt(0)}</Text>
                        )
                    )}
                </View>
                {!convo.isLocked && convo.isOnline && (
                    <View style={[styles.onlineDot, { backgroundColor: colors.success, borderColor: colors.card }]} />
                )}
            </View>

            <View style={styles.convoContent}>
                <View style={styles.convoHeadingRow}>
                    <Text style={[styles.participantNameText, { color: colors.foreground }]}>{convo.participantName}</Text>
                    <Text style={[styles.timestampLabel, { color: colors.mutedForeground }]}>{convo.lastMessageTime}</Text>
                </View>
                <View style={styles.convoPreviewRow}>
                    {convo.isLocked ? (
                        <View style={styles.lockedWarning}>
                            <Ionicons name="lock-closed" size={12} color={colors.warning} />
                            <Text style={[styles.lockedMsg, { color: colors.warning }]}>Unlock with Pro</Text>
                        </View>
                    ) : (
                        <Text
                            style={[
                                styles.lastMsgCopy,
                                {
                                    color: convo.unreadCount > 0 ? colors.foreground : colors.mutedForeground,
                                    fontWeight: convo.unreadCount > 0 ? '600' : '400'
                                }
                            ]}
                            numberOfLines={1}
                        >
                            {convo.lastMessage}
                        </Text>
                    )}
                    {convo.unreadCount > 0 && (
                        <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                            <Text style={styles.unreadCountLabel}>{convo.unreadCount}</Text>
                        </View>
                    )}
                    {!convo.isLocked && convo.unreadCount === 0 && (
                        <Ionicons name="checkmark-done" size={16} color={colors.primary} />
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

/**
 * MessagesScreen manages the list of user conversations.
 * Modernized with an immersive brand header and premium list components.
 */
export default function MessagesScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();

    const topInsetOffset = Platform.OS === "ios" ? insets.top : 20;

    const lockedChats = MOCK_CONVOS.filter(c => c.isLocked);
    const unlockedChats = MOCK_CONVOS.filter(c => !c.isLocked);

    const ListHeader = () => (
        <View style={styles.headerArea}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
            <View style={[styles.headerSolid, { backgroundColor: colors.primary, paddingTop: topInsetOffset + 12 }]}>
                <View style={styles.titleBar}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingBottom: 5 }}>
                            <Feather name="arrow-left" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View>
                            <Text style={[styles.brandSubtitle, { color: 'rgba(255,255,255,0.7)' }]}>Connect &</Text>
                            <Text style={[styles.brandTitle, { color: '#fff' }]}>Messages</Text>
                        </View>
                    </View>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity
                            style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
                            onPress={() => navigation.navigate("NewChat")}
                        >
                            <Ionicons name="create-outline" size={22} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
                            onPress={() => navigation.navigate("MessageSettings")}
                        >
                            <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.overlapSection}>
                {/* Modern Search Experience */}
                <TouchableOpacity
                    style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate("SearchMessages")}
                >
                    <Feather name="search" size={18} color={colors.mutedForeground} />
                    <Text style={[styles.searchPlaceholder, { color: colors.mutedForeground }]}>Search conversations...</Text>
                    <View style={[styles.filterIndicator, { backgroundColor: colors.primary + "15" }]}>
                        <Ionicons name="options-outline" size={16} color={colors.primary} />
                    </View>
                </TouchableOpacity>

                {lockedChats.length > 0 && (
                    <View style={[styles.upgradeBanner, { backgroundColor: colors.primary }]}>
                        <View style={styles.bannerInfo}>
                            <View style={styles.bannerIconBox}>
                                <Ionicons name="sparkles" size={16} color={colors.primary} />
                            </View>
                            <View>
                                <Text style={styles.bannerTitle}>Pro Conversations</Text>
                                <Text style={styles.bannerDesc}>You have {lockedChats.length} encrypted chats waiting.</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.bannerBtn}>
                            <Text style={[styles.bannerBtnText, { color: colors.primary }]}>Upgrade</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.listSubHeadingRow}>
                    <Text style={[styles.listSubHeading, { color: colors.foreground }]}>Recent Chats</Text>
                    <TouchableOpacity>
                        <Text style={[styles.markReadText, { color: colors.primary }]}>Mark all as read</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={[styles.messagesRoot, { backgroundColor: colors.background }]}>
            <FlatList
                data={[...unlockedChats, ...lockedChats]}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={ListHeader}
                renderItem={({ item }) => (
                    <View style={styles.convoWrapper}>
                        <ConversationItem
                            convo={item}
                            onPress={() => navigation.navigate("Chat", { id: item.id })}
                        />
                    </View>
                )}
                contentContainerStyle={[styles.messagesListPadding, { paddingBottom: 100 }]}
                showsVerticalScrollIndicator={false}
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
        width: '100%',
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
    brandSubtitle: { fontSize: 13, fontWeight: '500', marginBottom: 2 },
    brandTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
    headerIcons: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    iconBox: {
        width: 42,
        height: 42,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    overlapSection: {
        paddingHorizontal: 16,
        marginTop: -30,
    },
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
    searchPlaceholder: { flex: 1, fontSize: 16, fontWeight: '400' },
    filterIndicator: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
    upgradeBanner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderRadius: 20,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
    },
    bannerInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    bannerIconBox: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
    bannerTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
    bannerDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '400' },
    bannerBtn: { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
    bannerBtnText: { fontSize: 12, fontWeight: '700' },
    listSubHeadingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    listSubHeading: { fontSize: 18, fontWeight: '700' },
    markReadText: { fontSize: 13, fontWeight: '600' },
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
    avatarContainer: { position: 'relative' },
    participantAvatar: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", overflow: 'hidden' },
    avatarImg: { width: '100%', height: '100%' },
    avatarLabel: { color: "#fff", fontSize: 20, fontWeight: '700' },
    onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, borderWidth: 2.5 },
    convoContent: { flex: 1 },
    convoHeadingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
    participantNameText: { fontSize: 16, fontWeight: '700' },
    timestampLabel: { fontSize: 11, fontWeight: '500' },
    convoPreviewRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    lastMsgCopy: { flex: 1, fontSize: 13, marginRight: 10 },
    lockedWarning: { flexDirection: "row", alignItems: "center", gap: 5 },
    lockedMsg: { fontSize: 12, fontWeight: '600' },
    unreadBadge: { minWidth: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
    unreadCountLabel: { color: "#fff", fontSize: 10, fontWeight: '800' },
});
