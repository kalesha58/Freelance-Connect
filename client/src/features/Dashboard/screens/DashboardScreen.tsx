import React from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    StatusBar,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { StatsCard } from "@/components/StatsCard/StatsCard";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const FREELANCER_ACTIVITY = [
    { id: "1", title: "New job application received", time: "2h ago", icon: "briefcase" as const, colorKey: "primary" as const },
    { id: "2", title: "Your proposal was viewed", time: "5h ago", icon: "eye" as const, colorKey: "purpleAccent" as const },
    { id: "3", title: "Client sent a message", time: "Yesterday", icon: "message-circle" as const, colorKey: "success" as const },
];

const HIRING_ACTIVITY = [
    { id: "h1", title: "New applicant for UI Designer", time: "1h ago", icon: "users" as const, colorKey: "primary" as const },
    { id: "h2", title: "Job post #124 is now active", time: "4h ago", icon: "check-circle" as const, colorKey: "success" as const },
    { id: "h3", title: "Invoice #82 paid successfully", time: "1d ago", icon: "dollar-sign" as const, colorKey: "purpleAccent" as const },
];

/**
 * DashboardScreen provides business metrics and performance overviews.
 * Dynamically adjusts UI based on user role (Freelancer vs Hiring Partner).
 */
export default function DashboardScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const { user } = useApp();
    const navigation = useNavigation<any>();

    const isHiring = user?.role === "hiring" || user?.role === "requester";
    const topInsetOffset = Platform.OS === "ios" ? insets.top : 20;

    // Mock data based on role
    const earnings = user?.earnings ?? (isHiring ? 8500 : 12450);
    const projects = user?.projectsCompleted ?? (isHiring ? 12 : 24);
    const activity = isHiring ? HIRING_ACTIVITY : FREELANCER_ACTIVITY;

    return (
        <ScrollView
            style={[styles.mainView, { backgroundColor: colors.background }]}
            contentContainerStyle={[styles.scrollContentLayout, {
                paddingTop: topInsetOffset + 10,
                paddingBottom: 100,
            }]}
            showsVerticalScrollIndicator={false}
        >
            <StatusBar barStyle="light-content" backgroundColor={colors.headerBackground} />
            <View style={[styles.headerSolid, { backgroundColor: colors.headerBackground, paddingTop: insets.top }]}>
                <View style={styles.titleRow}>
                    <View>
                        <Text style={[styles.dashboardHeading, { color: '#fff' }]}>Dashboard</Text>
                        <Text style={[styles.dashboardSubtitle, { color: 'rgba(255,255,255,0.7)' }]}>
                            {isHiring ? "Hiring performance" : "Performance overview"}
                        </Text>
                    </View>
                    <TouchableOpacity style={[styles.periodSelectionBtnSolid, { backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.2)' }]}>
                        <Text style={[styles.periodLabel, { color: '#fff' }]}>This Month</Text>
                        <Feather name="chevron-down" size={14} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={[styles.earningsBannerSurface, { backgroundColor: isHiring ? colors.headerBackground : colors.navyDeep }]}>
                <View>
                    <Text style={styles.metricsLabelText}>{isHiring ? "Total Spend" : "Total Earnings"}</Text>
                    <Text style={styles.metricsValueTitle}>₹{earnings.toLocaleString()}</Text>
                    <View style={styles.growthIndicatorRow}>
                        <Feather name={isHiring ? "trending-down" : "trending-up"} size={14} color="#fff" />
                        <Text style={[styles.growthLabel, { color: "#fff" }]}>
                            {isHiring ? "-5.2% optimization" : "+12.5% from last month"}
                        </Text>
                    </View>
                </View>
                <View style={styles.earningsGhostIcon}>
                    <MaterialCommunityIcons
                        name={isHiring ? "wallet-outline" : "cash-multiple"}
                        size={40}
                        color="rgba(255,255,255,0.3)"
                    />
                </View>
            </View>

            <View style={styles.metricsGridArea}>
                <View style={styles.metricsGridRow}>
                    <StatsCard
                        label={isHiring ? "Active Jobs" : "Projects Done"}
                        value={isHiring ? "4" : projects.toString()}
                        sub={isHiring ? "2 new posts" : "+3 this month"}
                        color={colors.primary}
                        icon={<Feather name={isHiring ? "briefcase" : "check-circle"} size={18} color={colors.primary} />}
                    />
                    <StatsCard
                        label={isHiring ? "Applicants" : "Profile Views"}
                        value={isHiring ? "42" : "847"}
                        sub={isHiring ? "8 pending review" : "+24 today"}
                        color={colors.purpleAccent}
                        icon={<Feather name={isHiring ? "users" : "eye"} size={18} color={colors.purpleAccent} />}
                    />
                </View>
                <View style={styles.metricsGridRow}>
                    <StatsCard
                        label={isHiring ? "Talent Hired" : "Proposals Sent"}
                        value={isHiring ? "12" : "18"}
                        sub={isHiring ? "Full completion" : "4 pending"}
                        color={colors.warning}
                        icon={<Feather name={isHiring ? "award" : "send"} size={18} color={colors.warning} />}
                    />
                    <StatsCard
                        label={isHiring ? "Saved Talent" : "Post Likes"}
                        value={isHiring ? "28" : "2.4K"}
                        sub="+5 this week"
                        color={colors.success}
                        icon={<Feather name="heart" size={18} color={colors.success} />}
                    />
                </View>
            </View>

            <View style={[styles.earningsChartSurface, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.earningsChartHeader}>
                    <Text style={[styles.chartContextTitle, { color: colors.foreground }]}>
                        {isHiring ? "Spending Trends" : "Earnings Overview"}
                    </Text>
                    <View style={styles.chartLegendGroup}>
                        <View style={[styles.chartLegendDot, { backgroundColor: isHiring ? colors.primary : colors.primary }]} />
                        <Text style={[styles.chartLegendText, { color: colors.mutedForeground }]}>2025</Text>
                    </View>
                </View>
                <View style={styles.earningsBarsContainer}>
                    {[65, 82, 45, 90, 60, 78, 95].map((percentVal, idx) => (
                        <View key={idx} style={styles.earningsBarColumn}>
                            <View style={[styles.earningsBarFill, {
                                backgroundColor: isHiring ? colors.primary : colors.primary,
                                height: `${percentVal}%` as any,
                                opacity: idx === 6 ? 1 : 0.4 + (idx * 0.08)
                            }]} />
                            <Text style={[styles.earningsBarTimestamp, { color: colors.mutedForeground }]}>
                                {["M", "T", "W", "T", "F", "S", "S"][idx]}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            <Text style={[styles.recentActivityTitle, { color: colors.foreground }]}>Recent Activity</Text>
            {activity.map(logEntry => (
                <View key={logEntry.id} style={[styles.activityEntryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.activityIconWrapper, { backgroundColor: colors[logEntry.colorKey] + "18" }]}>
                        <Feather name={logEntry.icon as any} size={16} color={colors[logEntry.colorKey]} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.activityLabelText, { color: colors.foreground }]}>{logEntry.title}</Text>
                        <Text style={[styles.activityTimeText, { color: colors.mutedForeground }]}>{logEntry.time}</Text>
                    </View>
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    mainView: { flex: 1 },
    scrollContentLayout: { paddingHorizontal: 16 },
    titleRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    dashboardHeading: { fontSize: 24, fontWeight: '700', marginBottom: 2 },
    dashboardSubtitle: { fontSize: 13, fontWeight: '400' },
    headerSolid: {
        marginHorizontal: -16,
        paddingHorizontal: 16,
        paddingBottom: 20,
        marginBottom: 20,
    },
    periodSelectionBtnSolid: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
    },
    periodSelectionBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
    },
    periodLabel: { fontSize: 12, fontWeight: '500' },
    earningsBannerSurface: {
        borderRadius: 20,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
        overflow: "hidden",
    },
    metricsLabelText: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: '400', marginBottom: 4 },
    metricsValueTitle: { color: "#fff", fontSize: 32, fontWeight: '700', marginBottom: 8 },
    growthIndicatorRow: { flexDirection: "row", alignItems: "center", gap: 5 },
    growthLabel: { fontSize: 12, fontWeight: '500' },
    earningsGhostIcon: { opacity: 0.5 },
    metricsGridArea: { gap: 10, marginBottom: 16 },
    metricsGridRow: { flexDirection: "row", gap: 10 },
    earningsChartSurface: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    earningsChartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    chartContextTitle: { fontSize: 15, fontWeight: '700' },
    chartLegendGroup: { flexDirection: "row", alignItems: "center", gap: 6 },
    chartLegendDot: { width: 8, height: 8, borderRadius: 4 },
    chartLegendText: { fontSize: 12, fontWeight: '400' },
    earningsBarsContainer: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 120, gap: 6 },
    earningsBarColumn: { flex: 1, alignItems: "center", height: "100%", justifyContent: "flex-end", gap: 6 },
    earningsBarFill: { width: "100%", borderRadius: 6, minHeight: 10 },
    earningsBarTimestamp: { fontSize: 10, fontWeight: '500' },
    recentActivityTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
    activityEntryCard: { flexDirection: "row", alignItems: "center", borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, gap: 12 },
    activityIconWrapper: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    activityLabelText: { fontSize: 13, fontWeight: '500', marginBottom: 2 },
    activityTimeText: { fontSize: 11, fontWeight: '400' },
});
