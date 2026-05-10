import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useColors } from "@/hooks/useColors";
import { AppNotification, useApp } from "@/context/AppContext";

type IconLib = "feather" | "ionicons" | "material";
type IconConfig = { icon: string; color: (c: any) => string; lib: IconLib };

const ICON_MAP: Record<string, IconConfig> = {
    referral_joined: { icon: "user-plus", color: (c) => c.primary, lib: "feather" },
    referral_milestone: { icon: "trending-up", color: (c) => c.warning, lib: "feather" },
    referral_rewarded: { icon: "gift", color: (c) => c.success, lib: "feather" },
    referral_rejected: { icon: "x-circle", color: (c) => c.destructive, lib: "feather" },
    job: { icon: "briefcase", color: (c) => c.primary, lib: "feather" },
    message: { icon: "message-circle", color: (c) => c.success, lib: "feather" },
    like: { icon: "heart", color: (c) => c.destructive, lib: "feather" },
    comment: { icon: "message-square", color: (c) => c.purpleAccent, lib: "feather" },
    hire: { icon: "handshake", color: (c) => c.warning, lib: "material" },
    review: { icon: "star", color: (c) => c.warning, lib: "feather" },
    system: { icon: "bell", color: (c) => c.primary, lib: "feather" },
};

const formatRelativeTime = (iso: string): string => {
    const ts = new Date(iso).getTime();
    if (Number.isNaN(ts)) return "";
    const diff = Date.now() - ts;
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    if (diff < minute) return "Just now";
    if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
    if (diff < day) return `${Math.floor(diff / hour)}h ago`;
    if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
    return new Date(iso).toLocaleDateString();
};

export default function NotificationsScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { fetchNotifications, markNotificationRead, markAllNotificationsRead } = useApp();

    const [items, setItems] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const topInsetOffset = Platform.OS === "ios" ? insets.top : 20;

    const load = useCallback(async () => {
        try {
            const { items: list } = await fetchNotifications();
            setItems(list);
        } catch (err: any) {
            console.warn("Notifications load error:", err?.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [fetchNotifications]);

    useEffect(() => {
        load();
    }, [load]);

    const onRefresh = () => {
        setRefreshing(true);
        load();
    };

    const handleItemPress = async (item: AppNotification) => {
        if (item.read) return;
        setItems((prev) => prev.map((n) => (n._id === item._id ? { ...n, read: true } : n)));
        try {
            await markNotificationRead(item._id);
        } catch (err) {
            console.warn("Failed to mark read", err);
        }
    };

    const handleMarkAll = async () => {
        const hadUnread = items.some((n) => !n.read);
        if (!hadUnread) return;
        setItems((prev) => prev.map((n) => ({ ...n, read: true })));
        try {
            await markAllNotificationsRead();
        } catch (err) {
            console.warn("Failed to mark all read", err);
        }
    };

    const renderIcon = (type: string) => {
        const config = ICON_MAP[type] ?? ICON_MAP.system;
        const color = config.color(colors);
        if (config.lib === "material") {
            return <MaterialCommunityIcons name={config.icon} size={20} color={color} />;
        }
        if (config.lib === "ionicons") {
            return <Ionicons name={config.icon} size={20} color={color} />;
        }
        return <Feather name={config.icon} size={20} color={color} />;
    };

    return (
        <View style={[styles.notificationsRoot, { backgroundColor: colors.background }]}>
            <View
                style={[
                    styles.notificationsHeaderBar,
                    {
                        paddingTop: topInsetOffset + 6,
                        backgroundColor: colors.headerBackground,
                        borderBottomColor: "rgba(0,0,0,0.1)",
                    },
                ]}
            >
                <TouchableOpacity
                    style={[
                        styles.circularNavBtn,
                        { backgroundColor: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.2)" },
                    ]}
                    onPress={() => navigation.goBack()}
                >
                    <Feather name="arrow-left" size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={[styles.headerHeadingTitle, { color: "#fff" }]}>Notifications</Text>
                <TouchableOpacity onPress={handleMarkAll}>
                    <Text style={[styles.markReadAction, { color: "#fff", opacity: 0.9 }]}>Mark all read</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : items.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Feather name="bell-off" size={32} color={colors.mutedForeground} />
                    <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                        You're all caught up.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={[styles.notificationsListArea, { paddingBottom: 40 }]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    renderItem={({ item }) => {
                        const iconColor = (ICON_MAP[item.type]?.color(colors) ?? colors.primary) + "18";
                        return (
                            <TouchableOpacity
                                style={[
                                    styles.notificationItemCard,
                                    {
                                        backgroundColor: !item.read ? colors.blueLight : colors.card,
                                        borderColor: !item.read ? colors.primary + "30" : colors.border,
                                    },
                                ]}
                                activeOpacity={0.8}
                                onPress={() => handleItemPress(item)}
                            >
                                <View style={[styles.iconWrapperCircle, { backgroundColor: iconColor }]}>
                                    {renderIcon(item.type)}
                                </View>
                                <View style={styles.notificationDisplayBody}>
                                    <View style={styles.notificationMetaInfoRow}>
                                        <Text style={[styles.notificationTitleHeading, { color: colors.foreground }]}>
                                            {item.title}
                                        </Text>
                                        {!item.read && (
                                            <View style={[styles.unreadStatusIndicator, { backgroundColor: colors.primary }]} />
                                        )}
                                    </View>
                                    {!!item.body && (
                                        <Text
                                            style={[styles.notificationDescriptionText, { color: colors.mutedForeground }]}
                                            numberOfLines={2}
                                        >
                                            {item.body}
                                        </Text>
                                    )}
                                    <Text style={[styles.notificationAgeTimestamp, { color: colors.mutedForeground }]}>
                                        {formatRelativeTime(item.createdAt)}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    notificationsRoot: { flex: 1 },
    notificationsHeaderBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
    circularNavBtn: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    headerHeadingTitle: { fontSize: 18, fontWeight: '700' },
    markReadAction: { fontSize: 13, fontWeight: '500' },
    notificationsListArea: { padding: 16, gap: 8 },
    notificationItemCard: { flexDirection: "row", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
    iconWrapperCircle: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    notificationDisplayBody: { flex: 1, gap: 3 },
    notificationMetaInfoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    notificationTitleHeading: { fontSize: 14, fontWeight: '700' },
    unreadStatusIndicator: { width: 8, height: 8, borderRadius: 4 },
    notificationDescriptionText: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
    notificationAgeTimestamp: { fontSize: 11, fontWeight: '400' },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
    emptyText: { fontSize: 14, fontStyle: 'italic' },
});
