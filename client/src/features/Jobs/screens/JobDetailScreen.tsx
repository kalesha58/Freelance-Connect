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
import { displayBudgetINR } from "@/utils/formatters";

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
    const { jobs, applyToJob, savedJobIds, appliedJobIds, toggleSaveJob } = useApp();
    const job = jobs.find(j => (j._id === id || j.id === id));
    const hasApplied = job ? appliedJobIds.includes(job._id) : false;
    const [isApplying, setIsApplying] = useState(false);

    const handleApply = async () => {
        if (!job) return;
        setIsApplying(true);
        try {
            await applyToJob(job._id, "I'm interested in this job!"); // Simple cover letter for now
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
        <View style={[styles.jobDetailRoot, { backgroundColor: '#F8F9FB' }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FB" />
            
            {/* Minimalist Header */}
            <View style={[styles.navBar, { paddingTop: topInsetPadding + 10 }]}>
                <TouchableOpacity
                    style={[styles.backCircleBtn, { backgroundColor: '#FFF' }]}
                    onPress={() => navigation.goBack()}
                >
                    <Feather name="chevron-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.navBarTitle}>Job Details</Text>
                <TouchableOpacity style={[styles.backCircleBtn, { backgroundColor: '#FFF' }]}>
                    <Feather name="share-2" size={20} color="#000" />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Status Badge Area */}
                <View style={styles.statusInfoRow}>
                    <Text style={styles.reviewStatusText}>MATCHER REVIEWING APPLICATIONS</Text>
                    <Ionicons name="information-circle-outline" size={18} color="#666" />
                </View>

                {/* Main Job Info Card */}
                <View style={styles.whiteInfoCard}>
                    <View style={styles.titleHeaderRow}>
                        <Text style={styles.boldJobTitle}>{job.title}</Text>
                        <TouchableOpacity onPress={() => toggleSaveJob(job._id)}>
                            <Ionicons 
                                name={savedJobIds.includes(job._id) ? "bookmark" : "bookmark-outline"} 
                                size={26} 
                                color={colors.primary} 
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.statusMetaRow}>
                        <Text style={[styles.statusActiveLabel, { color: colors.primary }]}>Accepting Applications</Text>
                        <Text style={styles.postedTimeMeta}>Posted {formatRelativeTime(job.postedAt)}</Text>
                    </View>
                    <Text style={styles.positionsInfo}>0 of 2 positions filled</Text>
                </View>

                {/* Job Details Table */}
                <View style={styles.whiteInfoCard}>
                    <View style={styles.cardHeaderWithIcon}>
                        <Text style={styles.cardTitleText}>Job Details</Text>
                        <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                    </View>

                    {[
                        { label: "Specialization:", value: job.category },
                        { label: "Commitment:", value: "Full-time (40 hrs/wk)" },
                        { label: "Work Setup:", value: job.isRemote ? "Remote" : "On-site" },
                        { label: "Location:", value: job.location },
                        { label: "Est. Length:", value: "2 to 3 months" },
                        { label: "Job Posted:", value: formatRelativeTime(job.postedAt) },
                    ].map((item, idx) => (
                        <View key={idx} style={styles.detailTableRow}>
                            <Text style={styles.detailTableLabel}>{item.label}</Text>
                            <Text style={styles.detailTableValue}>{item.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Required Skills Section */}
                <View style={styles.whiteInfoCard}>
                    <View style={styles.cardHeaderWithIcon}>
                        <View style={styles.iconTitleRow}>
                            <View style={styles.warningIconBg}>
                                <Ionicons name="alert" size={14} color="#FFF" />
                            </View>
                            <Text style={styles.cardTitleText}>Required Skills</Text>
                        </View>
                    </View>

                    <View style={styles.skillsFlowContainer}>
                        {job.skills.map(skill => (
                            <View key={skill} style={styles.matcherSkillChip}>
                                <Feather name="arrow-up-circle" size={14} color="#059669" />
                                <Text style={styles.matcherSkillLabel}>{skill}</Text>
                            </View>
                        ))}
                    </View>
                </View>
                
                {/* Description */}
                <View style={styles.whiteInfoCard}>
                    <Text style={styles.cardTitleText}>Job Description</Text>
                    <Text style={styles.matcherDescriptionText}>{job.description}</Text>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={[styles.matcherBottomBar, { paddingBottom: insets.bottom + 10 }]}>
                <TouchableOpacity style={styles.hideJobBtn}>
                    <Text style={styles.hideJobBtnText}>Hide Job</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[
                        styles.interestedBtn, 
                        { backgroundColor: hasApplied ? '#94A3B8' : colors.primary }
                    ]}
                    onPress={handleApply}
                    disabled={hasApplied || isApplying}
                >
                    <Text style={styles.interestedBtnText}>
                        {isApplying ? "Applying..." : hasApplied ? "Applied" : "I'm Interested"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    jobDetailRoot: { flex: 1 },
    navBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    backCircleBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    navBarTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#111',
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 120,
    },
    statusInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        marginTop: 10,
        marginBottom: 20,
    },
    reviewStatusText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#888',
        letterSpacing: 0.5,
    },
    whiteInfoCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 24,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 1,
    },
    titleHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 16,
        marginBottom: 16,
    },
    boldJobTitle: {
        flex: 1,
        fontSize: 22,
        fontWeight: '800',
        color: '#111',
        lineHeight: 28,
        letterSpacing: -0.5,
    },
    statusMetaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 6,
    },
    statusActiveLabel: {
        fontSize: 14,
        fontWeight: '700',
    },
    postedTimeMeta: {
        fontSize: 13,
        fontWeight: '500',
        color: '#10B981',
    },
    positionsInfo: {
        fontSize: 13,
        fontWeight: '500',
        color: '#666',
    },
    cardHeaderWithIcon: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    cardTitleText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#111',
    },
    detailTableRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    detailTableLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    detailTableValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111',
    },
    iconTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    warningIconBg: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#D97706',
        alignItems: "center",
        justifyContent: "center",
    },
    skillsFlowContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    matcherSkillChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    matcherSkillLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#111',
    },
    matcherDescriptionText: {
        fontSize: 15,
        color: '#444',
        lineHeight: 22,
        fontWeight: '400',
    },
    matcherBottomBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255,255,255,0.95)',
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingTop: 15,
        gap: 15,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
    },
    hideJobBtn: {
        flex: 1,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F1F5F9',
        alignItems: "center",
        justifyContent: "center",
    },
    hideJobBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111',
    },
    interestedBtn: {
        flex: 1.2,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
    },
    interestedBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
});
