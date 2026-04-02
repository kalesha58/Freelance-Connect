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
                <View style={[styles.catBadge, { backgroundColor: colors.primary + "12" }]}>
                    <Text style={[styles.catText, { color: colors.primary }]}>{job.category}</Text>
                </View>
                <TouchableOpacity style={styles.bookmarkBtn} activeOpacity={0.7}>
                    <Ionicons name="bookmark-outline" size={20} color={colors.mutedForeground} />
                </TouchableOpacity>
            </View>

            {/* Title & Budget Section */}
            <View style={styles.contentBody}>
                <View style={styles.titleWrapper}>
                    <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
                        {job.title}
                    </Text>
                </View>
                <View style={[styles.budgetBadge, { backgroundColor: colors.success + "12" }]}>
                    <Text style={[styles.budgetText, { color: colors.success }]}>{job.budget}</Text>
                </View>
            </View>

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
                    <View key={skill} style={[styles.skillChip, { backgroundColor: colors.muted + "40" }]}>
                        <Text style={[styles.skillText, { color: colors.mutedForeground }]}>{skill}</Text>
                    </View>
                ))}
                {job.skills.length > 3 && (
                    <Text style={[styles.moreSkillsText, { color: colors.primary }]}>+{job.skills.length - 3}</Text>
                )}
            </View>

            {/* Footer: Client Info */}
            <View style={[styles.footer, { borderTopColor: colors.border }]}>
                <View style={styles.clientInfo}>
                    <View style={[styles.clientAvatar, { backgroundColor: colors.primary }]}>
                        <Text style={styles.avatarLabel}>{job.clientName.charAt(0)}</Text>
                        <View style={[styles.onlineIndicator, { backgroundColor: colors.success }]} />
                    </View>
                    <View>
                        <Text style={[styles.clientNameText, { color: colors.foreground }]}>{job.clientName}</Text>
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={10} color="#FFB01F" />
                            <Text style={[styles.ratingText, { color: colors.mutedForeground }]}>{job.clientRating}</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity style={[styles.applyBtn, { backgroundColor: colors.primary }]}>
                    <Text style={styles.applyBtnText}>Apply</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    catBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
    },
    catText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    bookmarkBtn: {
        padding: 4,
    },
    contentBody: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
        marginBottom: 10,
    },
    titleWrapper: {
        flex: 1,
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        lineHeight: 24,
    },
    budgetBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    budgetText: {
        fontSize: 14,
        fontWeight: '700',
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 14,
        gap: 12,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        fontWeight: '500',
    },
    metaSeparator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#cbd5e1',
    },
    skillsWrapper: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 18,
    },
    skillChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    skillText: {
        fontSize: 11,
        fontWeight: '500',
    },
    moreSkillsText: {
        fontSize: 11,
        fontWeight: '600',
        alignSelf: "center",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 16,
        borderTopWidth: 1,
    },
    clientInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    clientAvatar: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    avatarLabel: {
        color: "#fff",
        fontSize: 14,
        fontWeight: '700',
    },
    onlineIndicator: {
        position: "absolute",
        bottom: -2,
        right: -2,
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: "#fff",
    },
    clientNameText: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 2,
    },
    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
    ratingText: {
        fontSize: 10,
        fontWeight: '600',
    },
    applyBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
    },
    applyBtnText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: '700',
    },
});
