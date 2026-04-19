import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useColors } from "@/hooks/useColors";

/**
 * Interface defining the properties for a Freelancer profile.
 */
export interface IFreelancerProfile {
    id: string;
    name: string;
    avatar?: string;
    title?: string;
    rating: number;
    skills: string[];
    bio: string;
    hourlyRate: string;
    location: string;
    isTopRated?: boolean;
    completedProjects?: number;
    /** Number of client reviews (from API freelancerReviews) */
    reviewsCount?: number;
}

/**
 * Properties for the FreelancerCard component.
 */
interface IFreelancerCardProps {
    freelancer: IFreelancerProfile;
    onPress: () => void;
    onHire: () => void;
}

/**
 * Modern FreelancerCard providing a rich summary of a freelancer profile.
 * Redesigned for a high-fidelity visual experience.
 */
export function FreelancerCard({ freelancer, onPress, onHire }: IFreelancerCardProps) {
    const colors = useColors();

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            {/* Top Row: Avatar, Info, and Top Rated Badge */}
            <View style={styles.topRow}>
                <View style={styles.profileWrapper}>
                    <View style={[styles.avatarBorder, { borderColor: colors.primary + "30" }]}>
                        {freelancer.avatar ? (
                            <Image source={{ uri: freelancer.avatar }} style={styles.avatarImg} />
                        ) : (
                            <View style={[styles.avatarFallback, { backgroundColor: colors.headerBackground }]}>
                                <Text style={styles.avatarInitial}>{freelancer.name.charAt(0)}</Text>
                            </View>
                        )}
                        {freelancer.isTopRated && (
                            <View style={[styles.topRatedBadge, { backgroundColor: colors.warning }]}>
                                <Ionicons name="shield-checkmark" size={10} color="#fff" />
                            </View>
                        )}
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={[styles.nameText, { color: colors.foreground }]}>{freelancer.name}</Text>
                        {!!freelancer.title?.trim() && (
                            <Text style={[styles.taglineText, { color: colors.mutedForeground }]} numberOfLines={1}>
                                {freelancer.title}
                            </Text>
                        )}
                        <View style={styles.locationRow}>
                            <Feather name="map-pin" size={10} color={colors.mutedForeground} />
                            <Text style={[styles.locationText, { color: colors.mutedForeground }]}>{freelancer.location}</Text>
                        </View>
                    </View>
                </View>
                <View style={[styles.priceBadge, { backgroundColor: colors.primary + "12" }]}>
                    <Text style={[styles.priceText, { color: colors.primary }]}>{freelancer.hourlyRate}</Text>
                    <Text style={[styles.priceSub, { color: colors.primary }]}>/hr</Text>
                </View>
            </View>

            {/* Rating and Projects Summary */}
            <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                    <Ionicons name="star" size={14} color="#FFB01F" />
                    <Text style={[styles.metricValue, { color: colors.foreground }]}>{freelancer.rating}</Text>
                    <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
                        (
                        {freelancer.reviewsCount != null && freelancer.reviewsCount > 0
                            ? `${freelancer.reviewsCount} reviews`
                            : `${freelancer.completedProjects || 0} jobs`}
                        )
                    </Text>
                </View>
                <View style={styles.metricSeparator} />
                <View style={styles.metricItem}>
                    <Feather name="briefcase" size={13} color={colors.primary} />
                    <Text style={[styles.metricValue, { color: colors.foreground }]}>98%</Text>
                    <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>Success</Text>
                </View>
            </View>

            {/* Bio Highlight */}
            <Text style={[styles.bioText, { color: colors.mutedForeground }]} numberOfLines={2}>
                {freelancer.bio}
            </Text>

            {/* Skill Chips */}
            <View style={styles.skillsWrapper}>
                {freelancer.skills.slice(0, 3).map((skill, idx) => (
                    <View key={`${skill}-${idx}`} style={[styles.skillChip, { backgroundColor: colors.muted + "40" }]}>
                        <Text style={[styles.skillText, { color: colors.mutedForeground }]}>{skill}</Text>
                    </View>
                ))}
            </View>


            {/* Action Row */}
            <View style={[styles.footer, { borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.outlineBtn, { borderColor: colors.border }]}
                    onPress={onPress}
                >
                    <Text style={[styles.outlineBtnText, { color: colors.foreground }]}>View Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.primaryBtn, { backgroundColor: colors.buttonPrimary }]}
                    onPress={onHire}
                >
                    <Text style={[styles.primaryBtnText, { color: colors.onButtonPrimary }]}>Hire Now</Text>
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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 4,
    },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 16,
    },
    profileWrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    avatarBorder: {
        width: 54,
        height: 54,
        borderRadius: 27,
        borderWidth: 2,
        padding: 2,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    avatarImg: {
        width: 46,
        height: 46,
        borderRadius: 23,
    },
    avatarFallback: {
        width: 46,
        height: 46,
        borderRadius: 23,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarInitial: {
        color: "#fff",
        fontSize: 20,
        fontWeight: '700',
    },
    topRatedBadge: {
        position: "absolute",
        top: -2,
        right: -2,
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#fff",
    },
    headerInfo: {
        justifyContent: "center",
    },
    nameText: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    taglineText: {
        fontSize: 11,
        fontWeight: '500',
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    locationText: {
        fontSize: 11,
        fontWeight: '500',
    },
    priceBadge: {
        flexDirection: "row",
        alignItems: "baseline",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    priceText: {
        fontSize: 16,
        fontWeight: '700',
    },
    priceSub: {
        fontSize: 10,
        fontWeight: '600',
        marginLeft: 2,
    },
    metricsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 12,
    },
    metricItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    metricValue: {
        fontSize: 13,
        fontWeight: '700',
    },
    metricLabel: {
        fontSize: 11,
        fontWeight: '400',
    },
    metricSeparator: {
        width: 1,
        height: 12,
        backgroundColor: "#cbd5e1",
    },
    bioText: {
        fontSize: 13,
        lineHeight: 20,
        fontWeight: '400',
        marginBottom: 16,
    },
    skillsWrapper: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 20,
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
    footer: {
        flexDirection: "row",
        gap: 12,
        paddingTop: 16,
        borderTopWidth: 1,
    },
    outlineBtn: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        borderWidth: 1.5,
        alignItems: "center",
        justifyContent: "center",
    },
    outlineBtnText: {
        fontSize: 14,
        fontWeight: '700',
    },
    primaryBtn: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    primaryBtnText: {
        fontSize: 14,
        fontWeight: '700',
    },
});
