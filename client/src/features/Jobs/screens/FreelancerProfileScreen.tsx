import React from "react";
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

import { IFreelancerProfile } from "@/components";
import { useColors } from "@/hooks/useColors";

/**
 * Type for Freelancer Profile route parameters.
 */
type FreelancerProfileRouteProp = RouteProp<{ FreelancerProfile: { id: string } }, 'FreelancerProfile'>;

const MOCK_FREELANCERS: IFreelancerProfile[] = [
    { id: "f1", name: "Sarah Chen", title: "Senior UI/UX Designer", bio: "Award-winning designer with 6+ years creating digital experiences for startups and Fortune 500 companies. Specializing in mobile-first design, brand identity, and complex product UX.", skills: ["Figma", "UI Design", "UX Research", "Branding", "Prototyping"], rating: 4.9, reviews: 87, hourlyRate: "$95", location: "San Francisco, USA", projectsCompleted: 142, isAvailable: true },
    { id: "f2", name: "Marcus Johnson", title: "Full Stack Developer", bio: "Building scalable web and mobile apps. Passionate about clean code and great user experiences.", skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"], rating: 4.8, reviews: 63, hourlyRate: "$110", location: "Austin, TX", projectsCompleted: 89, isAvailable: true },
];

const PORTFOLIO_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#ef4444"];

const REVIEWS = [
    { id: "r1", author: "TechCorp Inc.", rating: 5, comment: "Absolutely incredible work! Delivered on time and exceeded expectations.", time: "2 weeks ago" },
    { id: "r2", author: "FinStart Solutions", rating: 5, comment: "Professional, communicative, and extremely talented. Will hire again.", time: "1 month ago" },
    { id: "r3", author: "DataDriven Co.", rating: 4, comment: "Great quality work and fast turnaround. Minor revision requests handled graciously.", time: "2 months ago" },
];

/**
 * FreelancerProfileScreen displays a detailed view of a freelancer's professional profile.
 * Specialized for hiring partners to evaluate talent with portfolio and reviews.
 */
export default function FreelancerProfileScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const route = useRoute<FreelancerProfileRouteProp>();
    const { id } = route.params || {};

    const freelancer = MOCK_FREELANCERS.find(f => f.id === id) || MOCK_FREELANCERS[0];
    const topPaddingOffset = Platform.OS === "ios" ? insets.top : 20;

    return (
        <View style={[styles.profileRoot, { backgroundColor: colors.background }]}>
            <View style={[styles.headerActions, { paddingTop: topPaddingOffset + 6 }]}>
                <TouchableOpacity
                    style={[styles.circularActionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => navigation.goBack()}
                >
                    <Feather name="arrow-left" size={20} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitleLabel, { color: colors.foreground }]}>Freelancer Profile</Text>
                <TouchableOpacity style={[styles.circularActionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Feather name="share-2" size={18} color={colors.foreground} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={[styles.scrollContentLayout, { paddingBottom: 120 }]} showsVerticalScrollIndicator={false}>
                <View style={[styles.mainHeroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.avatarCircleSurface, { backgroundColor: colors.primary }]}>
                        <Text style={styles.avatarInitialLabel}>{freelancer.name.charAt(0)}</Text>
                    </View>
                    {freelancer.isAvailable && (
                        <View style={[styles.availabilityIndicatorBadge, { backgroundColor: colors.success + "18" }]}>
                            <View style={[styles.pulseStatusDot, { backgroundColor: colors.success }]} />
                            <Text style={[styles.availabilityBadgeLabel, { color: colors.success }]}>Available for hire</Text>
                        </View>
                    )}
                    <Text style={[styles.profileNameHeading, { color: colors.foreground }]}>{freelancer.name}</Text>
                    <Text style={[styles.professionalTitleLabel, { color: colors.mutedForeground }]}>{freelancer.title}</Text>
                    <View style={styles.metadataBriefRow}>
                        <Feather name="map-pin" size={13} color={colors.mutedForeground} />
                        <Text style={[styles.metadataBriefLabel, { color: colors.mutedForeground }]}>{freelancer.location}</Text>
                        <Text style={[styles.metadataBriefLabel, { color: colors.mutedForeground }]}>•</Text>
                        <Ionicons name="star" size={13} color={colors.warning} />
                        <Text style={[styles.ratingNumericVal, { color: colors.foreground }]}>{freelancer.rating}</Text>
                        <Text style={[styles.metadataBriefLabel, { color: colors.mutedForeground }]}>({freelancer.reviews})</Text>
                    </View>
                    <Text style={[styles.biographyTextBody, { color: colors.mutedForeground }]}>{freelancer.bio}</Text>
                    <View style={styles.skillsTagCloud}>
                        {freelancer.skills.map(skill => (
                            <View key={skill} style={[styles.skillTagChip, { backgroundColor: colors.blueLight }]}>
                                <Text style={[styles.skillTagLabel, { color: colors.primary }]}>{skill}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.keyPowerStatsGrid}>
                    {[
                        { label: "Projects", value: freelancer.projectsCompleted.toString(), color: colors.primary, icon: "briefcase" as const },
                        { label: "Reviews", value: freelancer.reviews.toString(), color: colors.warning, icon: "star" as const },
                        { label: "Rate/hr", value: freelancer.hourlyRate, color: colors.success, icon: "dollar-sign" as const },
                        { label: "Success", value: "97%", color: colors.purpleAccent, icon: "trending-up" as const },
                    ].map(stat => (
                        <View key={stat.label} style={[styles.individualStatCell, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Feather name={stat.icon} size={18} color={stat.color} />
                            <Text style={[styles.statValueLabel, { color: colors.foreground }]}>{stat.value}</Text>
                            <Text style={[styles.statContextLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                <Text style={[styles.sectionHeadingText, { color: colors.foreground }]}>Portfolio</Text>
                <View style={styles.portfolioDisplayGrid}>
                    {PORTFOLIO_COLORS.map((hexColor, index) => (
                        <TouchableOpacity key={index} style={[styles.portfolioGalleryItem, { backgroundColor: hexColor }]} activeOpacity={0.85}>
                            <MaterialCommunityIcons name="image-outline" size={28} color="rgba(255,255,255,0.8)" />
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={[styles.sectionHeadingText, { color: colors.foreground }]}>Reviews</Text>
                {REVIEWS.map(review => (
                    <View key={review.id} style={[styles.peerReviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.reviewHeaderContext}>
                            <View style={[styles.reviewAuthorAvatarDisk, { backgroundColor: colors.navyMid }]}>
                                <Text style={styles.reviewAuthorInitial}>{review.author.charAt(0)}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.reviewAuthorNameLabel, { color: colors.foreground }]}>{review.author}</Text>
                                <View style={styles.starsDisplayRow}>
                                    {Array.from({ length: review.rating }).map((_, starIndex) => (
                                        <Ionicons key={starIndex} name="star" size={12} color={colors.warning} />
                                    ))}
                                    <Text style={[styles.reviewAgeLabel, { color: colors.mutedForeground }]}> • {review.time}</Text>
                                </View>
                            </View>
                        </View>
                        <Text style={[styles.reviewBodyCopy, { color: colors.mutedForeground }]}>{review.comment}</Text>
                    </View>
                ))}
            </ScrollView>

            <View style={[styles.bottomConversionBar, {
                backgroundColor: colors.card,
                borderTopColor: colors.border,
                paddingBottom: Platform.OS === "ios" ? insets.bottom + 10 : 24,
            }]}>
                <TouchableOpacity
                    style={[styles.secondaryContactActionBtn, { borderColor: colors.primary }]}
                    onPress={() => navigation.navigate("Chat", { id: "conv1" })}
                    activeOpacity={0.85}
                >
                    <Feather name="message-circle" size={18} color={colors.primary} />
                    <Text style={[styles.secondaryContactLabel, { color: colors.primary }]}>Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.primaryHireActionBtn, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate("HireConfirm", { freelancerId: freelancer.id })}
                    activeOpacity={0.85}
                >
                    <Text style={styles.primaryHireActionLabel}>Hire {freelancer.name.split(" ")[0]}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    profileRoot: { flex: 1 },
    headerActions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12 },
    circularActionBtn: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
    headerTitleLabel: { flex: 1, textAlign: "center", fontSize: 16, fontWeight: '700', marginHorizontal: 10 },
    scrollContentLayout: { paddingHorizontal: 16, paddingTop: 8 },
    mainHeroCard: { borderRadius: 20, padding: 20, borderWidth: 1, alignItems: "center", marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4 },
    avatarCircleSurface: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 10 },
    avatarInitialLabel: { color: "#fff", fontSize: 32, fontWeight: '700' },
    availabilityIndicatorBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
    pulseStatusDot: { width: 6, height: 6, borderRadius: 3 },
    availabilityBadgeLabel: { fontSize: 11, fontWeight: '600' },
    profileNameHeading: { fontSize: 20, fontWeight: '700', marginBottom: 2 },
    professionalTitleLabel: { fontSize: 13, fontWeight: '400', marginBottom: 8 },
    metadataBriefRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 },
    metadataBriefLabel: { fontSize: 12, fontWeight: '400' },
    ratingNumericVal: { fontSize: 12, fontWeight: '700' },
    biographyTextBody: { fontSize: 13, fontWeight: '400', textAlign: "center", lineHeight: 19, marginBottom: 14, paddingHorizontal: 8 },
    skillsTagCloud: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6 },
    skillTagChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    skillTagLabel: { fontSize: 12, fontWeight: '500' },
    keyPowerStatsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
    individualStatCell: { width: "47%", borderRadius: 14, padding: 14, borderWidth: 1, alignItems: "center", gap: 4 },
    statValueLabel: { fontSize: 18, fontWeight: '700' },
    statContextLabel: { fontSize: 11, fontWeight: '500' },
    sectionHeadingText: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
    portfolioDisplayGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
    portfolioGalleryItem: { width: "47%", aspectRatio: 1, borderRadius: 16, alignItems: "center", justifyContent: "center" },
    peerReviewCard: { borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 10 },
    reviewHeaderContext: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
    reviewAuthorAvatarDisk: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    reviewAuthorInitial: { color: "#fff", fontSize: 14, fontWeight: '700' },
    reviewAuthorNameLabel: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
    starsDisplayRow: { flexDirection: "row", alignItems: "center" },
    reviewAgeLabel: { fontSize: 11, fontWeight: '400' },
    reviewBodyCopy: { fontSize: 13, fontWeight: '400', lineHeight: 19 },
    bottomConversionBar: { flexDirection: "row", padding: 16, gap: 12, borderTopWidth: 1, position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10 },
    secondaryContactActionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderWidth: 1.5, borderRadius: 14, paddingVertical: 14 },
    secondaryContactLabel: { fontSize: 15, fontWeight: '600' },
    primaryHireActionBtn: { flex: 2, borderRadius: 14, paddingVertical: 14, alignItems: "center", justifyContent: "center" },
    primaryHireActionLabel: { color: "#fff", fontSize: 15, fontWeight: '700' },
});
