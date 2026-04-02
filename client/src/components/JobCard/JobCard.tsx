import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { useColors } from "@/hooks/useColors";

/**
 * Interface defining the properties for a Job.
 */
export interface IJob {
    id: string;
    title: string;
    clientName: string;
    clientRating: string;
    postedAt: string;
    budget: string;
    location: string;
    category: string;
    skills: string[];
    isRemote: boolean;
    description?: string;
}

interface IJobCardProps {
    job: IJob;
}

/**
 * Modern JobCard providing a high-fidelity summary of a job posting.
 */
export function JobCard({ job }: IJobCardProps) {
    const colors = useColors();
    const navigation = useNavigation<any>();

    const handlePress = () => {
        navigation.navigate("JobDetail", { id: job.id });
    };

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handlePress}
            activeOpacity={0.9}
        >
            {/* Header: Category & Bookmark */}
            <View style={styles.header}>
                <View style={[styles.catBadge, { backgroundColor: colors.primary + "08" }]}>
                    <Text style={[styles.catText, { color: colors.primary }]}>{job.category}</Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.bookmarkBtn} activeOpacity={0.7}>
                        <Ionicons name="bookmark-outline" size={22} color={colors.mutedForeground} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Title & Budget Section */}
            <View style={styles.contentBody}>
                <View style={styles.titleWrapper}>
                    <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
                        {job.title}
                    </Text>
                </View>
                <View style={[styles.budgetWrapper]}>
                    <Text style={[styles.budgetLabel, { color: colors.mutedForeground }]}>Budget</Text>
                    <Text style={[styles.budgetText, { color: colors.success }]}>{job.budget}</Text>
                </View>
            </View>

            {/* Description Snippet (Upwork style) */}
            {job.description && (
                <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={2}>
                    {job.description}
                </Text>
            )}

            {/* Metadata (Location & Time) */}
            <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                    <Feather name="map-pin" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{job.location}</Text>
                </View>
                <View style={styles.metaSeparator} />
                <View style={styles.metaItem}>
                    <Feather name="clock" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{job.postedAt}</Text>
                </View>
            </View>

            {/* Skills Chips */}
            <View style={styles.skillsWrapper}>
                {job.skills.slice(0, 3).map((skill, idx) => (
                    <View key={skill} style={[styles.skillChip, { backgroundColor: colors.muted + "20" }]}>
                        <Text style={[styles.skillText, { color: colors.mutedForeground }]}>{skill}</Text>
                    </View>
                ))}
                {job.skills.length > 3 && (
                    <View style={styles.moreSkillsChip}>
                        <Text style={[styles.moreSkillsText, { color: colors.primary }]}>+{job.skills.length - 3}</Text>
                    </View>
                )}
            </View>

            {/* Footer: Client Info */}
            <View style={[styles.footer, { borderTopColor: colors.border + "50" }]}>
                <View style={styles.clientInfo}>
                    <View style={[styles.clientAvatar, { backgroundColor: colors.primary }]}>
                        <Text style={styles.avatarLabel}>{job.clientName.charAt(0)}</Text>
                        <View style={[styles.onlineIndicator, { backgroundColor: colors.success }]} />
                    </View>
                    <View>
                        <View style={styles.clientNameRow}>
                            <Text style={[styles.clientNameText, { color: colors.foreground }]}>{job.clientName}</Text>
                            <MaterialCommunityIcons name="check-decagram" size={14} color={colors.primary} style={styles.verifiedIcon} />
                        </View>
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={10} color="#FFB01F" />
                            <Text style={[styles.ratingText, { color: colors.mutedForeground }]}>{job.clientRating}</Text>
                            <Text style={[styles.clientSpentText, { color: colors.mutedForeground }]}>• $10k+ spent</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity style={[styles.applyBtn, { backgroundColor: colors.primary }]}>
                    <Text style={styles.applyBtnText}>Apply Now</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        shadowColor: "#64748b",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 2,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    headerActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    catBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    catText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
    bookmarkBtn: {
        padding: 4,
    },
    contentBody: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 16,
        marginBottom: 12,
    },
    titleWrapper: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 26,
        letterSpacing: -0.2,
    },
    budgetWrapper: {
        alignItems: 'flex-end',
    },
    budgetLabel: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    budgetText: {
        fontSize: 18,
        fontWeight: '800',
    },
    description: {
        fontSize: 13,
        lineHeight: 20,
        fontWeight: '400',
        marginBottom: 16,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 18,
        gap: 12,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    metaText: {
        fontSize: 12,
        fontWeight: '500',
    },
    metaSeparator: {
        width: 3,
        height: 3,
        borderRadius: 2,
        backgroundColor: '#cbd5e1',
    },
    skillsWrapper: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 20,
    },
    skillChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    skillText: {
        fontSize: 11,
        fontWeight: '600',
    },
    moreSkillsChip: {
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    moreSkillsText: {
        fontSize: 11,
        fontWeight: '700',
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 18,
        borderTopWidth: 1,
    },
    clientInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    clientAvatar: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    avatarLabel: {
        color: "#fff",
        fontSize: 16,
        fontWeight: '700',
    },
    onlineIndicator: {
        position: "absolute",
        bottom: -1,
        right: -1,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: "#fff",
    },
    clientNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 2,
    },
    clientNameText: {
        fontSize: 13,
        fontWeight: '700',
    },
    verifiedIcon: {
        marginTop: 1,
    },
    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    ratingText: {
        fontSize: 11,
        fontWeight: '700',
    },
    clientSpentText: {
        fontSize: 11,
        fontWeight: '500',
    },
    applyBtn: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 14,
    },
    applyBtnText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: '700',
    },
});
