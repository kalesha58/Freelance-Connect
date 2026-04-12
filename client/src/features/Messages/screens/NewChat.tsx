import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    Image,
    StatusBar,
    Platform,
    ActivityIndicator,
    TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { useFirebase, buildConversationId } from "@/context/FirebaseContext";

interface ContactUser {
    _id: string;
    name: string;
    role: string;
    tagline?: string;
    avatar?: string;
    profilePic?: string;
    skills?: string[];
}

export default function NewChat() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { fetchAllUsers, user } = useApp();
    const { sendMessage } = useFirebase();

    const topInsetOffset = Platform.OS === "ios" ? insets.top : 20;

    const [contacts, setContacts] = useState<ContactUser[]>([]);
    const [filtered, setFiltered] = useState<ContactUser[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [startingChat, setStartingChat] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await fetchAllUsers();
            setContacts(data);
            setFiltered(data);
        } catch (err) {
            console.error("NewChat loadUsers:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text: string) => {
        setSearch(text);
        if (!text.trim()) {
            setFiltered(contacts);
            return;
        }
        const lower = text.toLowerCase();
        setFiltered(
            contacts.filter(
                c =>
                    c.name.toLowerCase().includes(lower) ||
                    c.role?.toLowerCase().includes(lower) ||
                    c.tagline?.toLowerCase().includes(lower)
            )
        );
    };

    const handleStartChat = async (contact: ContactUser) => {
        if (!user?._id) return;
        setStartingChat(contact._id);
        try {
            // Build/ensure conversation exists in Firestore with participant metadata
            const convId = await sendMessage(
                user._id,
                contact._id,
                "",                                         // empty text = just create thread
                user.name,                                  // senderName
                user.avatar || user.profilePic,             // senderAvatar
                contact.name,                               // receiverName
                contact.avatar || contact.profilePic,       // receiverAvatar
            );
            navigation.navigate("Chat", {
                conversationId: convId,
                participantId: contact._id,
                participantName: contact.name,
                participantAvatar: contact.avatar || contact.profilePic,
            });
        } catch (err: any) {
            console.error("Start chat error:", err);
            // Optionally alert user or show toast here
            if (err?.message?.includes('initialized')) {
                console.warn("NewChat: Firebase not ready yet.");
            }
        } finally {
            setStartingChat(null);
        }
    };

    return (
        <View style={[styles.root, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: topInsetOffset + 10, borderBottomColor: colors.border }]}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Feather name="arrow-left" size={24} color={colors.foreground} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.foreground }]}>New Message</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Search */}
                <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Feather name="search" size={16} color={colors.mutedForeground} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.foreground }]}
                        placeholder="Search users..."
                        placeholderTextColor={colors.mutedForeground}
                        value={search}
                        onChangeText={handleSearch}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => handleSearch("")}>
                            <Feather name="x" size={16} color={colors.mutedForeground} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {loading ? (
                <View style={styles.loaderBox}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loaderText, { color: colors.mutedForeground }]}>
                        Loading users...
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.contactItem, { borderBottomColor: colors.border + "40" }]}
                            onPress={() => handleStartChat(item)}
                            disabled={startingChat === item._id}
                        >
                            <View style={styles.avatarWrapper}>
                                {item.avatar || item.profilePic ? (
                                    <Image
                                        source={{ uri: item.avatar || item.profilePic }}
                                        style={styles.avatar}
                                    />
                                ) : (
                                    <View style={[styles.avatarPlaceholder, { backgroundColor: colors.headerBackground }]}>
                                        <Text style={styles.avatarInitial}>{item.name.charAt(0).toUpperCase()}</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.contactInfo}>
                                <Text style={[styles.contactName, { color: colors.foreground }]}>{item.name}</Text>
                                <Text style={[styles.contactRole, { color: colors.mutedForeground }]}>
                                    {item.tagline || item.role}
                                </Text>
                            </View>
                            {startingChat === item._id ? (
                                <ActivityIndicator size="small" color={colors.primary} />
                            ) : (
                                <Feather name="message-circle" size={20} color={colors.primary} />
                            )}
                        </TouchableOpacity>
                    )}
                    ListHeaderComponent={() => (
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
                                {filtered.length} {filtered.length === 1 ? "user" : "users"} found
                            </Text>
                        </View>
                    )}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyBox}>
                            <Feather name="users" size={40} color={colors.mutedForeground} />
                            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                                No users found
                            </Text>
                        </View>
                    )}
                    contentContainerStyle={{ paddingBottom: 40 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    header: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
    headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
    backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    headerTitle: { fontSize: 18, fontWeight: "700" },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 12,
        height: 44,
        gap: 8,
    },
    searchInput: { flex: 1, fontSize: 15, fontWeight: "400" },
    contactItem: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1 },
    avatarWrapper: { marginRight: 12 },
    avatar: { width: 50, height: 50, borderRadius: 25 },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarInitial: { color: "#fff", fontSize: 20, fontWeight: "700" },
    contactInfo: { flex: 1 },
    contactName: { fontSize: 16, fontWeight: "600", marginBottom: 2 },
    contactRole: { fontSize: 13, fontWeight: "400" },
    sectionHeader: { padding: 16, paddingTop: 20 },
    sectionTitle: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
    loaderBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    loaderText: { fontSize: 14, fontWeight: "400" },
    emptyBox: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 12 },
    emptyText: { fontSize: 14, fontWeight: "400" },
});
