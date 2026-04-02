import React, { useState } from "react";
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

import { useColors } from "@/hooks/useColors";

const ACTIVE_JOBS = [
    { id: "j1", title: "Senior React Native Developer", budget: "$5,000 - $8,000", status: "active", applicants: 12, postedAt: "2d ago" },
    { id: "j2", title: "UI/UX Designer for FinTech App", budget: "$80/hr", status: "active", applicants: 8, postedAt: "5d ago" },
    { id: "j3", title: "Brand Identity Designer", budget: "$2,000 - $4,000", status: "active", applicants: 31, postedAt: "1w ago" },
];

const COMPLETED_JOBS = [
    { id: "j4", title: "Mobile App Prototype", budget: "$3,000", status: "completed", applicants: 0, postedAt: "2 months ago" },
    { id: "j5", title: "Website Redesign", budget: "$6,500", status: "completed", applicants: 0, postedAt: "3 months ago" },
];

/**
 * MyJobsScreen provides requesters with a dashboard of their active and historical postings.
 * Features a tabbed interface for quick switching between job states.
 */
export default function MyJobsScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

    const topInsetOffset = Platform.OS === "ios" ? insets.top : 20;
    const currentJobsList = activeTab === "active" ? ACTIVE_JOBS : COMPLETED_JOBS;

    return (
        <View style={[styles.myJobsRoot, { backgroundColor: colors.background }]}>
            <View style={[styles.myJobsHeaderArea, { paddingTop: topInsetOffset + 10, borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.circularNavBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => navigation.goBack()}
                >
                    <Feather name="arrow-left" size={20} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.myJobsTitleHeading, { color: colors.foreground }]}>My Jobs</Text>
                <TouchableOpacity
                    style={[styles.quickAddActionBtn, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate("CreateJob")}
                >
                    <Feather name="plus" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={[styles.jobStateTabsRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                {(["active", "completed"] as const).map(tabKey => (
                    <TouchableOpacity
                        key={tabKey}
                        style={[styles.individualStateTab, activeTab === tabKey && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                        onPress={() => setActiveTab(tabKey)}
                    >
                        <Text style={[styles.tabLabelText, { color: activeTab === tabKey ? colors.primary : colors.mutedForeground }]}>
                            {tabKey.charAt(0).toUpperCase() + tabKey.slice(1)} Jobs
                        </Text>
                        <View style={[styles.stateCountBadge, { backgroundColor: activeTab === tabKey ? colors.primary : colors.muted }]}>
                            <Text style={[styles.badgeDigitLabel, { color: activeTab === tabKey ? "#fff" : colors.mutedForeground }]}>
                                {(tabKey === "active" ? ACTIVE_JOBS : COMPLETED_JOBS).length}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={currentJobsList}
                keyExtractor={item => item.id}
                contentContainerStyle={[styles.jobsListScrollPadding, { paddingBottom: 40 }]}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <View style={[styles.jobDashboardCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.jobBriefHeader}>
                            <View style={[styles.statusIndicatorDot, { backgroundColor: item.status === "active" ? colors.success : colors.mutedForeground }]} />
                            <Text style={[styles.timestampSubLabel, { color: colors.mutedForeground }]}>{item.postedAt}</Text>
                        </View>
                        <Text style={[styles.briefJobTitleLabel, { color: colors.foreground }]} numberOfLines={2}>{item.title}</Text>
                        <Text style={[styles.jobBudgetValLabel, { color: colors.primary }]}>{item.budget}</Text>

                        {item.status === "active" && (
                            <View style={styles.applicantTallyRow}>
                                <Feather name="users" size={14} color={colors.mutedForeground} />
                                <Text style={[styles.applicantTallyLabel, { color: colors.mutedForeground }]}>{item.applicants} applicants</Text>
                            </View>
                        )}

                        <View style={[styles.horizontalDividerLine, { backgroundColor: colors.border }]} />

                        <View style={styles.jobActionButtonsRow}>
                            {item.status === "active" ? (
                                <>
                                    <TouchableOpacity
                                        style={[styles.primaryApplicantsReviewBtn, { borderColor: colors.primary }]}
                                        onPress={() => navigation.navigate("Applicants", { jobId: item.id, jobTitle: item.title })}
                                    >
                                        <Feather name="users" size={14} color={colors.primary} />
                                        <Text style={[styles.applicantsReviewLabel, { color: colors.primary }]}>Applicants</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.secondaryQuickEditBtn, { backgroundColor: colors.muted }]}>
                                        <Feather name="edit-2" size={14} color={colors.mutedForeground} />
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <View style={[styles.completedStatusBadge, { backgroundColor: colors.success + "18" }]}>
                                    <Feather name="check-circle" size={14} color={colors.success} />
                                    <Text style={[styles.completedStatusLabel, { color: colors.success }]}>Completed</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyListPlaceholder}>
                        <Feather name="briefcase" size={48} color={colors.mutedForeground} />
                        <Text style={[styles.emptyListTitle, { color: colors.foreground }]}>No {activeTab} jobs</Text>
                        {activeTab === "active" && (
                            <TouchableOpacity
                                style={[styles.callToPostActionBtn, { backgroundColor: colors.primary }]}
                                onPress={() => navigation.navigate("CreateJob")}
                            >
                                <Text style={styles.callToPostLabel}>Post Your First Job</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    myJobsRoot: { flex: 1 },
    myJobsHeaderArea: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
    circularNavBtn: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
    myJobsTitleHeading: { fontSize: 18, fontWeight: '700' },
    quickAddActionBtn: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    jobStateTabsRow: { flexDirection: "row", borderBottomWidth: 1 },
    individualStateTab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: "transparent" },
    tabLabelText: { fontSize: 14, fontWeight: '600' },
    stateCountBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
    badgeDigitLabel: { fontSize: 11, fontWeight: '700' },
    jobsListScrollPadding: { padding: 16, gap: 12 },
    jobDashboardCard: { borderRadius: 16, padding: 16, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    jobBriefHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
    statusIndicatorDot: { width: 8, height: 8, borderRadius: 4 },
    timestampSubLabel: { fontSize: 12, fontWeight: '400' },
    briefJobTitleLabel: { fontSize: 16, fontWeight: '700', lineHeight: 22, marginBottom: 4 },
    jobBudgetValLabel: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
    applicantTallyRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 12 },
    applicantTallyLabel: { fontSize: 12, fontWeight: '400' },
    horizontalDividerLine: { height: 1, marginBottom: 12 },
    jobActionButtonsRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    primaryApplicantsReviewBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderWidth: 1.5, borderRadius: 10, paddingVertical: 9 },
    applicantsReviewLabel: { fontSize: 13, fontWeight: '600' },
    secondaryQuickEditBtn: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    completedStatusBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
    completedStatusLabel: { fontSize: 13, fontWeight: '600' },
    emptyListPlaceholder: { alignItems: "center", paddingTop: 60, gap: 12 },
    emptyListTitle: { fontSize: 18, fontWeight: '700' },
    callToPostActionBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
    callToPostLabel: { color: "#fff", fontSize: 14, fontWeight: '700' },
});
