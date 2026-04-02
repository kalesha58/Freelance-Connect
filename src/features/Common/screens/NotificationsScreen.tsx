import React from "react";
import {
    FlatList,
    Platform,
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

const NOTIFICATIONS = [
    { id: "n1", type: "job", title: "New Job Match", body: "A new job matching your skills was posted: 'Senior React Native Developer'", time: "Just now", unread: true },
    { id: "n2", type: "message", title: "New Message", body: "TechCorp Inc. sent you a message: 'When can you start the project?'", time: "10 min ago", unread: true },
    { id: "n3", type: "like", title: "Post Liked", body: "Marcus Johnson and 23 others liked your portfolio post.", time: "1h ago", unread: true },
    { id: "n4", type: "job", title: "Application Viewed", body: "FinStart Solutions viewed your application for 'UI/UX Designer'.", time: "3h ago", unread: false },
    { id: "n5", type: "comment", title: "New Comment", body: "Sarah Chen commented on your post: 'This design is incredible!'", time: "5h ago", unread: false },
    { id: "n6", type: "hire", title: "Hire Request", body: "DataDriven Co. wants to hire you for their data science project.", time: "1d ago", unread: false },
    { id: "n7", type: "review", title: "New Review", body: "You received a 5-star review from HealthTech Pro.", time: "2d ago", unread: false },
    { id: "n8", type: "job", title: "Deadline Reminder", body: "Your proposal for 'Brand Identity Designer' expires in 2 days.", time: "3d ago", unread: false },
];

type IconLib = "feather" | "ionicons" | "material";
type IconConfig = { icon: string; color: (c: any) => string; lib: IconLib };

const ICON_MAP: Record<string, IconConfig> = {
    job: { icon: "briefcase", color: c => c.primary, lib: "feather" },
    message: { icon: "message-circle", color: c => c.success, lib: "feather" },
    like: { icon: "heart", color: c => c.destructive, lib: "feather" },
    comment: { icon: "message-square", color: c => c.purpleAccent, lib: "feather" },
    hire: { icon: "handshake", color: c => c.warning, lib: "material" },
    review: { icon: "star", color: c => c.warning, lib: "feather" },
};

/**
 * NotificationsScreen provides users with an activity feed for their account.
 */
export default function NotificationsScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();

    const topInsetOffset = Platform.OS === "ios" ? insets.top : 20;

    const renderNotificationIcon = (type: string) => {
        const config = ICON_MAP[type] ?? ICON_MAP.job;
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
            <View style={[styles.notificationsHeaderBar, { paddingTop: topInsetOffset + 6, borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.circularNavBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => navigation.goBack()}
                >
                    <Feather name="arrow-left" size={20} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerHeadingTitle, { color: colors.foreground }]}>Notifications</Text>
                <TouchableOpacity>
                    <Text style={[styles.markReadAction, { color: colors.primary }]}>Mark all read</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={NOTIFICATIONS}
                keyExtractor={item => item.id}
                contentContainerStyle={[styles.notificationsListArea, { paddingBottom: 40 }]}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.notificationItemCard,
                            { backgroundColor: item.unread ? colors.blueLight : colors.card, borderColor: item.unread ? colors.primary + "30" : colors.border },
                        ]}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.iconWrapperCircle, { backgroundColor: (ICON_MAP[item.type]?.color(colors) ?? colors.primary) + "18" }]}>
                            {renderNotificationIcon(item.type)}
                        </View>
                        <View style={styles.notificationDisplayBody}>
                            <View style={styles.notificationMetaInfoRow}>
                                <Text style={[styles.notificationTitleHeading, { color: colors.foreground }]}>{item.title}</Text>
                                {item.unread && <View style={[styles.unreadStatusIndicator, { backgroundColor: colors.primary }]} />}
                            </View>
                            <Text style={[styles.notificationDescriptionText, { color: colors.mutedForeground }]} numberOfLines={2}>{item.body}</Text>
                            <Text style={[styles.notificationAgeTimestamp, { color: colors.mutedForeground }]}>{item.time}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    notificationsRoot: { flex: 1 },
    notificationsHeaderBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
    circularNavBtn: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
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
});
