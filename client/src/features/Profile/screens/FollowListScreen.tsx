import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";

import { useColors } from "@/hooks/useColors";
import { apiClient } from "@/utils/apiClient";
import type { RootStackParamList } from "@/navigation/types";

export type FollowListUser = {
    _id: string;
    name: string;
    tagline?: string;
    avatar?: string;
    profilePic?: string;
    role?: string;
};

type Route = RouteProp<RootStackParamList, "FollowList">;

export default function FollowListScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const route = useRoute<Route>();
    const { mode } = route.params || { mode: "following" };

    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<FollowListUser[]>([]);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const path = mode === "followers" ? "/follow/me/followers" : "/follow/me/following";
            const data = await apiClient(path);
            setUsers(Array.isArray(data) ? data : []);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Could not load list");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [mode]);

    useEffect(() => {
        load();
    }, [load]);

    const topPad = Platform.OS === "ios" ? insets.top : 16;
    const title = mode === "followers" ? "Followers" : "Following";

    const renderItem = ({ item }: { item: FollowListUser }) => {
        const uri = item.avatar || item.profilePic;
        const initial = (item.name || "?").charAt(0).toUpperCase();
        return (
            <TouchableOpacity
                style={[styles.row, { borderBottomColor: colors.border, backgroundColor: colors.card }]}
                onPress={() => navigation.navigate("FreelancerProfile", { id: item._id })}
                activeOpacity={0.85}
            >
                {uri ? (
                    <Image source={{ uri }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatarFallback, { backgroundColor: colors.headerBackground }]}>
                        <Text style={styles.avatarLetter}>{initial}</Text>
                    </View>
                )}
                <View style={{ flex: 1 }}>
                    <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
                        {item.name}
                    </Text>
                    {item.tagline ? (
                        <Text style={[styles.tag, { color: colors.mutedForeground }]} numberOfLines={1}>
                            {item.tagline}
                        </Text>
                    ) : null}
                </View>
                <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.root, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={12}>
                    <Feather name="arrow-left" size={22} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground }]}>{title}</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : error ? (
                <View style={styles.centered}>
                    <Text style={{ color: colors.mutedForeground, textAlign: "center", marginBottom: 12 }}>{error}</Text>
                    <TouchableOpacity onPress={load}>
                        <Text style={{ color: colors.primary, fontWeight: "600" }}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={[
                        styles.listContent,
                        { paddingBottom: insets.bottom + 24 },
                        users.length === 0 && styles.emptyList,
                    ]}
                    ListEmptyComponent={
                        <Text style={{ color: colors.mutedForeground, textAlign: "center", marginTop: 40 }}>
                            {mode === "followers"
                                ? "No followers yet. Keep your profile polished to grow your network."
                                : "You’re not following anyone yet. Discover freelancers from Jobs or Community."}
                        </Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingBottom: 14,
        borderBottomWidth: 1,
    },
    backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    headerTitle: { fontSize: 17, fontWeight: "700" },
    listContent: { paddingTop: 8 },
    emptyList: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24 },
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        gap: 12,
    },
    avatar: { width: 48, height: 48, borderRadius: 24 },
    avatarFallback: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarLetter: { color: "#fff", fontSize: 18, fontWeight: "700" },
    name: { fontSize: 16, fontWeight: "600" },
    tag: { fontSize: 13, marginTop: 2 },
    centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
});
