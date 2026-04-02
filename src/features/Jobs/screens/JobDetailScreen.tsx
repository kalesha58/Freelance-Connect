import React, { useState } from "react";
import {
    Platform,
    ScrollView,
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

const MOCK_JOB: IJobDetail = {
    id: "j1",
    title: "React Native Developer for E-commerce App",
    category: "Mobile Development",
    isRemote: true,
    clientName: "Global Shop Inc.",
    clientRating: "4.9",
    postedAt: "2h ago",
    budget: "$5,000 - $8,000",
    location: "New York, USA",
    deadline: "Oct 15, 2025",
    applicants: 14,
    description: "We are looking for an experienced React Native developer to help us build out new features for our existing e-commerce mobile application. The ideal candidate has strong experience with Redux, Reanimated 2, and integrating RESTful APIs.\n\nKey Responsibilities:\n• Implement new UI components based on Figma designs.\n• Optimize app performance and load times.\n• Fix existing bugs and improve state management logic.",
    skills: ["React Native", "TypeScript", "Redux", "Figma", "REST APIs"],
};

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

    const [hasApplied, setHasApplied] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // In a real app, we would fetch the job by ID
    const job = MOCK_JOB;

    const topInsetPadding = Platform.OS === "ios" ? insets.top : 20;

    return (
        <View style={[styles.jobDetailRoot, { backgroundColor: colors.background }]}>
            <View style={[styles.topActionBar, { paddingTop: topInsetPadding + 6 }]}>
                <TouchableOpacity
                    style={[styles.actionCircularBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => navigation.goBack()}
                >
                    <Feather name="arrow-left" size={20} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.barTitleText, { color: colors.foreground }]} numberOfLines={1}>Job Details</Text>
                <TouchableOpacity
                    style={[styles.actionCircularBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => setIsSaved(!isSaved)}
                >
                    <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={20} color={isSaved ? colors.primary : colors.foreground} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={[styles.scrollDetailLayout, { paddingBottom: 120 }]}
                showsVerticalScrollIndicator={false}
            >
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
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.clientBusinessName, { color: colors.foreground }]}>{job.clientName}</Text>
                        <View style={styles.clientRatingLine}>
                            <Ionicons name="star" size={13} color={colors.warning} />
                            <Text style={[styles.ratingValueLabel, { color: colors.mutedForeground }]}>{job.clientRating} rating</Text>
                            <Text style={[styles.postTimestamp, { color: colors.mutedForeground }]}> • Posted {job.postedAt}</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.directChatBtn, { borderColor: colors.primary }]}
                        onPress={() => navigation.navigate("Messages")}
                    >
                        <Feather name="message-circle" size={16} color={colors.primary} />
                        <Text style={[styles.directChatBtnLabel, { color: colors.primary }]}>Chat</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.metricsGridSurface, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    {[
                        { icon: "dollar-sign" as const, label: "Budget", value: job.budget, color: colors.primary },
                        { icon: "map-pin" as const, label: "Location", value: job.location, color: colors.success },
                        { icon: "calendar" as const, label: "Deadline", value: job.deadline, color: colors.warning },
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
            </ScrollView>

            <View style={[styles.fixedBottomAction, {
                backgroundColor: colors.card,
                borderTopColor: colors.border,
                paddingBottom: Platform.OS === "ios" ? insets.bottom + 10 : 24,
            }]}>
                <TouchableOpacity
                    style={[styles.primaryApplyAction, { backgroundColor: hasApplied ? colors.success : colors.primary }]}
                    onPress={() => setHasApplied(true)}
                    disabled={hasApplied}
                    activeOpacity={0.85}
                >
                    {hasApplied ? (
                        <>
                            <Feather name="check" size={18} color="#fff" />
                            <Text style={styles.primaryApplyLabel}>Applied Successfully</Text>
                        </>
                    ) : (
                        <Text style={styles.primaryApplyLabel}>Apply Now</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    jobDetailRoot: { flex: 1 },
    scrollDetailLayout: { paddingHorizontal: 16, paddingTop: 8 },
    topActionBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    actionCircularBtn: {
        width: 40,
        height: 40,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
    },
    barTitleText: { flex: 1, textAlign: "center", fontSize: 16, fontWeight: '700', marginHorizontal: 10 },
    badgeCloudRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
    typeLabelBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
    typeLabelText: { fontSize: 12, fontWeight: '600' },
    mainJobHeading: { fontSize: 22, fontWeight: '700', lineHeight: 30, marginBottom: 16 },
    clientInfoBlock: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
    clientAvatarDisk: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
    clientAvatarInitial: { color: "#fff", fontSize: 18, fontWeight: '700' },
    clientBusinessName: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
    clientRatingLine: { flexDirection: "row", alignItems: "center", gap: 3 },
    ratingValueLabel: { fontSize: 12, fontWeight: '400' },
    postTimestamp: { fontSize: 12, fontWeight: '400' },
    directChatBtn: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 8 },
    directChatBtnLabel: { fontSize: 13, fontWeight: '600' },
    metricsGridSurface: { borderRadius: 16, borderWidth: 1, flexDirection: "row", flexWrap: "wrap", padding: 4, marginBottom: 14 },
    metricGridCell: { width: "50%", padding: 14, alignItems: "center", gap: 4 },
    metricIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 2 },
    metricLabelCopy: { fontSize: 11, fontWeight: '400' },
    metricValueCopy: { fontSize: 13, fontWeight: '700', textAlign: "center" },
    infoSectionCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14 },
    infoSectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
    descriptionBodyText: { fontSize: 14, fontWeight: '400', lineHeight: 22 },
    skillsTagLayout: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    skillTagChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    skillTagLabel: { fontSize: 12, fontWeight: '500' },
    fixedBottomAction: { padding: 16, borderTopWidth: 1, position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10 },
    primaryApplyAction: { borderRadius: 16, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
    primaryApplyLabel: { color: "#fff", fontSize: 16, fontWeight: '700' },
});
