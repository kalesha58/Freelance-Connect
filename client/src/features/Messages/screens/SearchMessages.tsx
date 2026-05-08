import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    FlatList,
    StatusBar,
    Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useColors } from "@/hooks/useColors";
import { useFirebase } from "@/context/FirebaseContext";
import { useApp } from "@/context/AppContext";
import { Image } from "react-native";

export default function SearchMessages() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const [searchQuery, setSearchQuery] = useState("");
    const { conversations } = useFirebase();
    const { user, blockedUserIds, fetchAllUsers } = useApp();
    const [allUsers, setAllUsers] = useState<any[]>([]);

    React.useEffect(() => {
        fetchAllUsers().then(setAllUsers).catch(() => {});
    }, [fetchAllUsers]);

    const userMap = React.useMemo(() => {
        const map: Record<string, any> = {};
        allUsers.forEach(u => {
            map[u._id] = u;
        });
        return map;
    }, [allUsers]);

    const filteredConversations = React.useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        const base = conversations.filter((item) => {
            const otherParticipantId = item.participants.find(id => id !== user?._id) ?? "";
            return !blockedUserIds.includes(otherParticipantId);
        });
        if (!query) return [];
        return base.filter(item => {
            const otherParticipantId = item.participants.find(id => id !== user?._id) ?? "";
            const nameFromDoc = item.participantNames?.[otherParticipantId];
            const nameFromMap = userMap[otherParticipantId]?.name;
            const name = nameFromDoc || nameFromMap || "User";
            
            return name.toLowerCase().includes(query) || (item.lastMessage || "").toLowerCase().includes(query);
        });
    }, [conversations, searchQuery, user?._id, blockedUserIds, userMap]);

    const filteredUsers = React.useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return [];
        return allUsers.filter(u => {
            if (u._id === user?._id) return false;
            // Exclude users who already have a conversation shown in 'filteredConversations'
            const hasConvo = filteredConversations.some(c => c.participants.includes(u._id));
            if (hasConvo) return false;
            
            return u.name?.toLowerCase().includes(query) || u.role?.toLowerCase().includes(query);
        });
    }, [allUsers, searchQuery, user?._id, filteredConversations]);

    const topInsetOffset = Platform.OS === "ios" ? insets.top : 20;

    return (
        <View style={[styles.root, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor={colors.headerBackground} />
            <View style={[styles.header, { backgroundColor: colors.headerBackground, paddingTop: topInsetOffset + 10 }]}>
                <View style={styles.searchContainer}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Feather name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={[styles.inputWrapper, { backgroundColor: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.2)" }]}>
                        <Feather name="search" size={18} color="#fff" />
                        <TextInput
                            style={[styles.input, { color: "#fff" }]}
                            placeholder="Search messages..."
                            placeholderTextColor="rgba(255,255,255,0.6)"
                            autoFocus
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery("")}>
                                <Ionicons name="close-circle" size={18} color="#fff" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            {searchQuery.length > 0 && (filteredConversations.length > 0 || filteredUsers.length > 0) ? (
                <FlatList
                    data={[...filteredConversations.map(c => ({ ...c, _type: 'convo' })), ...filteredUsers.map(u => ({ ...u, _type: 'user' }))]}
                    keyExtractor={item => item.id || item._id}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    renderItem={({ item }) => {
                        if (item._type === 'convo') {
                            const otherParticipantId = item.participants.find(id => id !== user?._id) ?? "";
                            const nameFromDoc = item.participantNames?.[otherParticipantId];
                            const nameFromMap = userMap[otherParticipantId]?.name;
                            const participantName = nameFromDoc || nameFromMap || "User";
                            
                            const avatarFromDoc = item.participantAvatars?.[otherParticipantId];
                            const avatarFromMap = userMap[otherParticipantId]?.avatar || userMap[otherParticipantId]?.profilePic;
                            const participantAvatar = avatarFromDoc || avatarFromMap;

                            return (
                                <TouchableOpacity
                                    style={[styles.resultRow, { borderBottomColor: colors.border }]}
                                    onPress={() => navigation.navigate("Chat", {
                                        conversationId: item.id,
                                        participantId: otherParticipantId,
                                        participantName,
                                        participantAvatar,
                                    })}
                                >
                                    <View style={[styles.avatarBox, { backgroundColor: colors.headerBackground }]}>
                                        {participantAvatar ? (
                                            <Image source={{ uri: participantAvatar }} style={styles.avatar} />
                                        ) : (
                                            <Text style={styles.avatarLabel}>{participantName.charAt(0).toUpperCase()}</Text>
                                        )}
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.resultName, { color: colors.foreground }]}>{participantName}</Text>
                                        <Text style={[styles.resultMsg, { color: colors.mutedForeground }]} numberOfLines={1}>
                                            {item.lastMessage}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        } else {
                            const u = item;
                            const participantName = u.name || "User";
                            const participantAvatar = u.avatar || u.profilePic;

                            return (
                                <TouchableOpacity
                                    style={[styles.resultRow, { borderBottomColor: colors.border }]}
                                    onPress={() => navigation.navigate("Chat", {
                                        participantId: u._id,
                                        participantName,
                                        participantAvatar,
                                    })}
                                >
                                    <View style={[styles.avatarBox, { backgroundColor: colors.purpleAccent }]}>
                                        {participantAvatar ? (
                                            <Image source={{ uri: participantAvatar }} style={styles.avatar} />
                                        ) : (
                                            <Text style={styles.avatarLabel}>{participantName.charAt(0).toUpperCase()}</Text>
                                        )}
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.resultName, { color: colors.foreground }]}>{participantName}</Text>
                                        <Text style={[styles.resultMsg, { color: colors.mutedForeground }]} numberOfLines={1}>
                                            {u.role || "Freelancer"} • Start chatting
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        }
                    }}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <View style={[styles.emptyIconBox, { backgroundColor: colors.blueLight }]}>
                        <Feather name="message-square" size={32} color={colors.primary} />
                    </View>
                    {searchQuery.length > 0 ? (
                        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                            No messages found for "{searchQuery}"
                        </Text>
                    ) : (
                        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                            Search your chats, contacts, or message history.
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    header: { paddingHorizontal: 16, paddingBottom: 16 },
    searchContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
    backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    inputWrapper: { flex: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, height: 48, gap: 8 },
    input: { flex: 1, fontSize: 16, padding: 0 },
    emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 },
    emptyIconBox: { width: 70, height: 70, borderRadius: 35, alignItems: "center", justifyContent: "center", marginBottom: 20 },
    emptyText: { fontSize: 15, fontWeight: "500", textAlign: "center", lineHeight: 22 },
    resultRow: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, gap: 12 },
    avatarBox: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", overflow: "hidden" },
    avatar: { width: "100%", height: "100%" },
    avatarLabel: { color: "#fff", fontSize: 16, fontWeight: "700" },
    resultName: { fontSize: 15, fontWeight: "600" },
    resultMsg: { fontSize: 13, fontWeight: "400", marginTop: 2 },
});
