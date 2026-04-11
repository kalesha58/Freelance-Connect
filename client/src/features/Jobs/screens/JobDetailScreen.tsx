import React, { useState } from "react";
import {
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { formatRelativeTime, formatSafeLocaleDate } from "@/utils/formatRelativeTime";

/**
 * Type for Job Detail route parameters.
 */
type JobDetailRouteProp = RouteProp<{ JobDetail: { id: string } }, 'JobDetail'>;

/**
 * Interface defining job specific details.
 */
interface IJobDetail {
    id: string;
    title: string;
    category: string;
    isRemote: boolean;
    clientName: string;
    clientRating: string;
    postedAt: string;
    budget: string;
    location: string;
    deadline: string;
    applicants: number;
    description: string;
    skills: string[];
}


/**
 * JobDetailScreen provides a comprehensive view of a specific job posting.
 * Built for React Native CLI with premium metrics grid and description area.
 */
export default function JobDetailScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const route = useRoute<JobDetailRouteProp>();
    const { id } = route.params || {};
    const { jobs, applyToJob } = useApp();
    const [hasApplied, setHasApplied] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isApplying, setIsApplying] = useState(false);

    const job = jobs.find(j => (j._id === id || j.id === id));

    const handleApply = async () => {
        if (!job) return;
        setIsApplying(true);
        try {
            await applyToJob(job._id, "I'm interested in this job!"); // Simple cover letter for now
            setHasApplied(true);
        } catch (error) {
            console.error("Apply Error:", error);
        } finally {
            setIsApplying(false);
        }
    };

    const topInsetPadding = Platform.OS === "ios" ? insets.top : 20;

    if (!job) {
        return (
            <View style={[styles.jobDetailRoot, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.foreground }}>Job not found</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: colors.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.jobDetailRoot, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor={colors.headerBackground} />
            <View style={[styles.headerSolid, { backgroundColor: colors.headerBackground, paddingTop: topInsetPadding + 12, paddingBottom: 40 }]}>
                <View style={styles.topActionBar}>
                    <TouchableOpacity
                        style={[styles.actionCircularBtn, { backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)' }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Feather name="arrow-left" size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={[styles.barTitleText, { color: '#fff' }]} numberOfLines={1}>Job Details</Text>
                    <TouchableOpacity
                        style={[styles.actionCircularBtn, { backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)' }]}
                        onPress={() => setIsSaved(!isSaved)}
                    >
                        <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={[styles.scrollDetailLayout, { paddingBottom: 120 }]}
                showsVerticalScrollIndicator={false}
                style={{ marginTop: -30 }}
            >
                <View style={[styles.detailContentCard, { backgroundColor: colors.background, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingTop: 24 }]}>
                    <View style={styles.badgeCloudRow}>
                        <View style={[styles.typeLabelBadge, { backgroundColor: colors.primary + "18" }]}>
                            <Text style={[styles.typeLabelText, { color: colors.primary }]}>{job.category}</Text>
                        </View>
                        {job.isRemote && (
                            <View style={[styles.typeLabelBadge, { backgroundColor: colors.success + "18" }]}>
                                <Text style={[styles.typeLabelText, { color: colors.success }]}>Remote</Text>
                            </View>
                        )}
                    </View>

                    <Text style={[styles.mainJobHeading, { color: colors.foreground }]}>{job.title}</Text>

                    <View style={styles.clientInfoBlock}>
                        <View style={[styles.clientAvatarDisk, { backgroundColor: colors.navyMid }]}>
                            <Text style={styles.clientAvatarInitial}>{job.clientName.charAt(0)}</Text>
                        </View>
                        <TouchableOpacity
                            style={{ flex: 1 }}
                            disabled={!job.clientId}
                            onPress={() => {
                                if (job.clientId) {
                                    navigation.navigate("FreelancerProfile", { id: String(job.clientId) });
                                }
                            }}
                            activeOpacity={job.clientId ? 0.75 : 1}
                        >
                            <Text style={[styles.clientBusinessName, { color: colors.foreground }]}>{job.clientName}</Text>
                            <View style={styles.clientRatingLine}>
                                <Ionicons name="star" size={13} color={colors.warning} />
                                <Text style={[styles.ratingValueLabel, { color: colors.mutedForeground }]}>{job.clientRating} rating</Text>
                                <Text style={[styles.postTimestamp, { color: colors.mutedForeground }]}> • Posted {formatRelativeTime(job.postedAt)}</Text>
                            </View>
                            {job.clientId ? (
                                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "600", marginTop: 4 }}>View profile</Text>
                            ) : null}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.directChatBtn, { borderColor: colors.primary }]}
                            onPress={() => navigation.navigate("Main", { screen: "Messages" })}
                        >
                            <Feather name="message-circle" size={16} color={colors.primary} />
                            <Text style={[styles.directChatBtnLabel, { color: colors.primary }]}>Chat</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.metricsGridSurface, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        {[
                            { icon: "dollar-sign" as const, label: "Budget", value: job.budget, color: colors.primary },
                            { icon: "map-pin" as const, label: "Location", value: job.location, color: colors.success },
                            {
                                icon: "calendar" as const,
                                label: "Deadline",
                                value: job.deadline ? formatSafeLocaleDate(job.deadline) : "Not set",
                                color: colors.warning,
                            },
                            { icon: "users" as const, label: "Applicants", value: `${job.applicants} applied`, color: colors.purpleAccent },
                        ].map(item => (
                            <View key={item.label} style={[styles.metricGridCell, { borderColor: colors.border }]}>
                                <View style={[styles.metricIconWrap, { backgroundColor: item.color + "18" }]}>
                                    <Feather name={item.icon} size={16} color={item.color} />
                                </View>
                                <Text style={[styles.metricLabelCopy, { color: colors.mutedForeground }]}>{item.label}</Text>
                                <Text style={[styles.metricValueCopy, { color: colors.foreground }]}>{item.value}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={[styles.infoSectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.infoSectionTitle, { color: colors.foreground }]}>Job Description</Text>
                        <Text style={[styles.descriptionBodyText, { color: colors.mutedForeground }]}>{job.description}</Text>
                    </View>

                    <View style={[styles.infoSectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.infoSectionTitle, { color: colors.foreground }]}>Required Skills</Text>
                        <View style={styles.skillsTagLayout}>
                            {job.skills.map(skill => (
                                <View key={skill} style={[styles.skillTagChip, { backgroundColor: colors.blueLight }]}>
                                    <MaterialCommunityIcons name="code-tags" size={13} color={colors.primary} />
                                    <Text style={[styles.skillTagLabel, { color: colors.primary }]}>{skill}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.fixedBottomAction, {
                backgroundColor: colors.card,
                borderTopColor: colors.border,
                paddingBottom: Platform.OS === "ios" ? insets.bottom + 10 : 24,
            }]}>
                <TouchableOpacity
                    style={[styles.primaryApplyAction, { backgroundColor: hasApplied ? colors.success : (isApplying ? colors.muted : colors.buttonPrimary) }]}
                    onPress={handleApply}
                    disabled={hasApplied || isApplying}
                    activeOpacity={0.85}
                >
                    {isApplying ? (
                        <Text style={[styles.primaryApplyLabel, { color: colors.foreground }]}>Applying...</Text>
                    ) : (
                        hasApplied ? (
                            <>
                                <Feather name="check" size={18} color="#fff" />
                                <Text style={[styles.primaryApplyLabel, { color: '#fff' }]}>Applied Successfully</Text>
                            </>
                        ) : (
                            <Text style={[styles.primaryApplyLabel, { color: colors.onButtonPrimary }]}>Apply Now</Text>
                        )
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    jobDetailRoot: { flex: 1 },
    headerSolid: {
        width: '100%',
        paddingBottom: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    topActionBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    scrollDetailLayout: { paddingBottom: 150 },
    detailContentCard: {
        paddingHorizontal: 16,
        minHeight: 1000,
    },
    actionCircularBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
    },
    barTitleText: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: '800', marginHorizontal: 10, letterSpacing: -0.5 },
    badgeCloudRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
    typeLabelBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    typeLabelText: { fontSize: 12, fontWeight: '600' },
    mainJobHeading: { fontSize: 24, fontWeight: '800', lineHeight: 32, marginBottom: 20, letterSpacing: -0.5 },
    clientInfoBlock: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20, padding: 12, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.02)' },
    clientAvatarDisk: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
    clientAvatarInitial: { color: "#fff", fontSize: 20, fontWeight: '700' },
    clientBusinessName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
    clientRatingLine: { flexDirection: "row", alignItems: "center", gap: 4 },
    ratingValueLabel: { fontSize: 13, fontWeight: '500' },
    postTimestamp: { fontSize: 13, fontWeight: '400' },
    directChatBtn: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 10 },
    directChatBtnLabel: { fontSize: 14, fontWeight: '700' },
    metricsGridSurface: { borderRadius: 20, borderWidth: 1, flexDirection: "row", flexWrap: "wrap", padding: 8, marginBottom: 18, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    metricGridCell: { width: "50%", padding: 16, alignItems: "center", gap: 6 },
    metricIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 4 },
    metricLabelCopy: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    metricValueCopy: { fontSize: 14, fontWeight: '700', textAlign: "center" },
    infoSectionCard: { borderRadius: 20, borderWidth: 1, padding: 20, marginBottom: 18 },
    infoSectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
    descriptionBodyText: { fontSize: 15, fontWeight: '400', lineHeight: 24 },
    skillsTagLayout: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    skillTagChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
    skillTagLabel: { fontSize: 13, fontWeight: '600' },
    fixedBottomAction: { padding: 20, borderTopWidth: 1, position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10, shadowColor: "#000", shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 10 },
    primaryApplyAction: { borderRadius: 18, paddingVertical: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
    primaryApplyLabel: { fontSize: 17, fontWeight: '800' },
});
