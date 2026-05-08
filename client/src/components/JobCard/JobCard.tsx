import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { useColors } from "@/hooks/useColors";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import { displayBudgetINR } from "@/utils/formatters";

/**
 * Interface defining the properties for a Job.
 */
export interface IJob {
    id: string;
    _id?: string;
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
    onSave?: (jobId: string) => void;
    isSaved?: boolean;
}

/**
 * Modern JobCard providing a high-fidelity summary of a job posting.
 */
export function JobCard({ job, onSave, isSaved }: IJobCardProps) {
    const colors = useColors();
    const navigation = useNavigation<any>();

    const handlePress = () => {
        const jobId = job._id || job.id;
        if (jobId) {
            navigation.navigate("JobDetail", { id: jobId });
        }
    };

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handlePress}
            activeOpacity={0.9}
        >
            <View style={styles.topRow}>
                <Text style={[styles.postedTime, { color: colors.success }]}>
                    {formatRelativeTime(job.postedAt)}
                </Text>
                <TouchableOpacity 
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    onPress={(e) => {
                        e.stopPropagation();
                        onSave && onSave(job._id || job.id);
                    }}
                >
                    <Ionicons 
                        name={isSaved ? "bookmark" : "bookmark-outline"} 
                        size={20} 
                        color={colors.primary} 
                    />
                </TouchableOpacity>
            </View>

            <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
                {job.title}
            </Text>

            <View style={styles.skillsWrapper}>
                {job.skills.slice(0, 3).map((skill, idx) => (
                    <View key={`${skill}-${idx}`} style={[styles.skillChip, { backgroundColor: colors.blueLight }]}>
                        <Feather name="arrow-up-circle" size={12} color={colors.primary} />
                        <Text style={[styles.skillText, { color: colors.foreground }]}>{skill}</Text>
                    </View>
                ))}
                {job.skills.length > 3 && (
                    <View style={[styles.skillChip, { backgroundColor: colors.muted + "20" }]}>
                        <Text style={[styles.skillText, { color: colors.mutedForeground }]}>...</Text>
                    </View>
                )}
            </View>

            <View style={styles.footerInfo}>
                <View style={styles.footerItem}>
                    <Text style={[styles.footerLabel, { color: colors.mutedForeground }]}>Budget:</Text>
                    <Text style={[styles.footerValue, { color: colors.success }]}>{displayBudgetINR(job.budget)}</Text>
                </View>
                <TouchableOpacity 
                    style={[styles.viewDetailsBtn, { backgroundColor: colors.primary }]}
                    onPress={handlePress}
                >
                    <Text style={styles.viewDetailsText}>View Details</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 12,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    statusBadge: {
        backgroundColor: 'rgba(0,0,0,0.03)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    postedTime: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 6,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        lineHeight: 24,
        marginBottom: 16,
        letterSpacing: -0.3,
    },
    skillsWrapper: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 20,
    },
    skillChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    skillText: {
        fontSize: 12,
        fontWeight: '600',
    },
    footerInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 16,
    },
    footerItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    footerLabel: {
        fontSize: 13,
        fontWeight: '500',
    },
    footerValue: {
        fontSize: 13,
        fontWeight: '700',
    },
    viewDetailsBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    viewDetailsText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFF',
    },
});
