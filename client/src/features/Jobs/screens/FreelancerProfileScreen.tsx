import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Linking,
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
import { apiClient } from "@/utils/apiClient";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import type { IPublicFreelancerProfile } from "./FreelancerProfileScreen.interfaces";

type FreelancerProfileRouteProp = RouteProp<{ FreelancerProfile: { id: string } }, "FreelancerProfile">;

/**
 * Loads a freelancer profile from the API by id (same data admins edit in User Management).
 */
export default function FreelancerProfileScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const route = useRoute<FreelancerProfileRouteProp>();
    const { id } = route.params || {};

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [profile, setProfile] = useState<IPublicFreelancerProfile | null>(null);

    const loadProfile = useCallback(async () => {
        if (!id) {
            setError("Missing profile id.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await apiClient(`/profile/${id}`);
            setProfile(data as IPublicFreelancerProfile);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Could not load profile.";
            setError(msg);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const topPaddingOffset = Platform.OS === "ios" ? insets.top : 20;

    const avatarUri = profile?.avatar || profile?.profilePic;
    const title = profile?.tagline?.trim() || "Freelancer";
    const reviewsList = profile?.freelancerReviews ?? [];
    const reviewsCount = reviewsList.length;
    const portfolioList = (profile?.portfolioItems ?? []).filter((p) => p?.imageUrl || p?.title);
    const ratingVal = profile?.rating ?? 0;
    const successPct =
        ratingVal > 0 ? Math.min(100, Math.round((ratingVal / 5) * 100)) : 0;

    if (loading && !profile) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background, paddingTop: topPaddingOffset }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: 12, color: colors.mutedForeground }}>Loading profile…</Text>
            </View>
        );
    }

    if (error || !profile) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background, paddingTop: topPaddingOffset, paddingHorizontal: 24 }]}>
                <Text style={{ color: colors.foreground, textAlign: "center", marginBottom: 16 }}>{error || "Profile not found."}</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.retryBtn, { borderColor: colors.primary }]}>
                    <Text style={{ color: colors.primary, fontWeight: "600" }}>Go back</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={loadProfile} style={{ marginTop: 12 }}>
                    <Text style={{ color: colors.primary }}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

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
                    {avatarUri ? (
                        <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                    ) : (
                        <View style={[styles.avatarCircleSurface, { backgroundColor: colors.headerBackground }]}>
                            <Text style={styles.avatarInitialLabel}>{profile.name.charAt(0)}</Text>
                        </View>
                    )}
                    {profile.isAvailableForHire !== false && (
                        <View style={[styles.availabilityIndicatorBadge, { backgroundColor: colors.success + "18" }]}>
                            <View style={[styles.pulseStatusDot, { backgroundColor: colors.success }]} />
                            <Text style={[styles.availabilityBadgeLabel, { color: colors.success }]}>Available for hire</Text>
                        </View>
                    )}
                    <Text style={[styles.profileNameHeading, { color: colors.foreground }]}>{profile.name}</Text>
                    <Text style={[styles.professionalTitleLabel, { color: colors.mutedForeground }]}>{title}</Text>
                    <View style={styles.metadataBriefRow}>
                        <Feather name="map-pin" size={13} color={colors.mutedForeground} />
                        <Text style={[styles.metadataBriefLabel, { color: colors.mutedForeground }]}>
                            {profile.location?.trim() || "Location not set"}
                        </Text>
                        <Text style={[styles.metadataBriefLabel, { color: colors.mutedForeground }]}>•</Text>
                        <Ionicons name="star" size={13} color={colors.warning} />
                        <Text style={[styles.ratingNumericVal, { color: colors.foreground }]}>{ratingVal.toFixed(1)}</Text>
                        <Text style={[styles.metadataBriefLabel, { color: colors.mutedForeground }]}>({reviewsCount} reviews)</Text>
                    </View>
                    <Text style={[styles.biographyTextBody, { color: colors.mutedForeground }]}>
                        {profile.bio?.trim() || "No bio yet."}
                    </Text>
                    <View style={styles.skillsTagCloud}>
                        {(profile.skills ?? []).map((skill) => (
                            <View key={skill} style={[styles.skillTagChip, { backgroundColor: colors.blueLight }]}>
                                <Text style={[styles.skillTagLabel, { color: colors.primary }]}>{skill}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.keyPowerStatsGrid}>
                    {[
                        { label: "Projects", value: String(profile.projectsCompleted ?? 0), color: colors.primary, icon: "briefcase" as const },
                        { label: "Reviews", value: String(reviewsCount), color: colors.warning, icon: "star" as const },
                        {
                            label: "Rate/hr",
                            value: `$${profile.hourlyRate ?? 0}`,
                            color: colors.success,
                            icon: "dollar-sign" as const,
                        },
                        { label: "Success", value: `${successPct}%`, color: colors.purpleAccent, icon: "trending-up" as const },
                    ].map((stat) => (
                        <View key={stat.label} style={[styles.individualStatCell, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Feather name={stat.icon} size={18} color={stat.color} />
                            <Text style={[styles.statValueLabel, { color: colors.foreground }]}>{stat.value}</Text>
                            <Text style={[styles.statContextLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                <Text style={[styles.sectionHeadingText, { color: colors.foreground }]}>Portfolio</Text>
                {portfolioList.length === 0 ? (
                    <Text style={{ color: colors.mutedForeground, marginBottom: 20 }}>No portfolio items yet.</Text>
                ) : (
                    <View style={styles.portfolioDisplayGrid}>
                        {portfolioList.map((item, index) => (
                            <TouchableOpacity
                                key={`${item.imageUrl}-${index}`}
                                style={[styles.portfolioGalleryItem, { backgroundColor: colors.muted + "30" }]}
                                activeOpacity={0.85}
                                onPress={() => {
                                    if (item.link) {
                                        Linking.openURL(item.link.startsWith("http") ? item.link : `https://${item.link}`);
                                    }
                                }}
                            >
                                {item.imageUrl ? (
                                    <Image source={{ uri: item.imageUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                                ) : (
                                    <MaterialCommunityIcons name="image-outline" size={28} color="rgba(255,255,255,0.8)" />
                                )}
                                {!!item.title && (
                                    <View style={styles.portfolioTitleOverlay}>
                                        <Text style={styles.portfolioTitleText} numberOfLines={2}>
                                            {item.title}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <Text style={[styles.sectionHeadingText, { color: colors.foreground }]}>Reviews</Text>
                {reviewsList.length === 0 ? (
                    <Text style={{ color: colors.mutedForeground, marginBottom: 12 }}>No reviews yet.</Text>
                ) : (
                    reviewsList.map((review, idx) => (
                        <View key={`${review.clientName}-${idx}`} style={[styles.peerReviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={styles.reviewHeaderContext}>
                                <View style={[styles.reviewAuthorAvatarDisk, { backgroundColor: colors.navyMid }]}>
                                    <Text style={styles.reviewAuthorInitial}>{review.clientName.charAt(0)}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.reviewAuthorNameLabel, { color: colors.foreground }]}>{review.clientName}</Text>
                                    <View style={styles.starsDisplayRow}>
                                        {Array.from({ length: Math.min(5, Math.round(review.rating)) }).map((_, starIndex) => (
                                            <Ionicons key={starIndex} name="star" size={12} color={colors.warning} />
                                        ))}
                                        <Text style={[styles.reviewAgeLabel, { color: colors.mutedForeground }]}>
                                            {" "}
                                            • {review.createdAt ? formatRelativeTime(review.createdAt) : "Recently"}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <Text style={[styles.reviewBodyCopy, { color: colors.mutedForeground }]}>{review.comment}</Text>
                        </View>
                    ))
                )}
            </ScrollView>

            <View
                style={[
                    styles.bottomConversionBar,
                    {
                        backgroundColor: colors.card,
                        borderTopColor: colors.border,
                        paddingBottom: Platform.OS === "ios" ? insets.bottom + 10 : 24,
                    },
                ]}
            >
                <TouchableOpacity
                    style={[styles.secondaryContactActionBtn, { borderColor: colors.primary }]}
                    onPress={() => navigation.navigate("Main", { screen: "Messages" })}
                    activeOpacity={0.85}
                >
                    <Feather name="message-circle" size={18} color={colors.primary} />
                    <Text style={[styles.secondaryContactLabel, { color: colors.primary }]}>Messages</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.primaryHireActionBtn, { backgroundColor: colors.buttonPrimary }]}
                    onPress={() => navigation.navigate("HireConfirm", { freelancerId: profile._id })}
                    activeOpacity={0.85}
                >
                    <Text style={[styles.primaryHireActionLabel, { color: colors.onButtonPrimary }]}>Hire {profile.name.split(" ")[0]}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    profileRoot: { flex: 1 },
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
    retryBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    headerActions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12 },
    circularActionBtn: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
    headerTitleLabel: { flex: 1, textAlign: "center", fontSize: 16, fontWeight: "700", marginHorizontal: 10 },
    scrollContentLayout: { paddingHorizontal: 16, paddingTop: 8 },
    mainHeroCard: { borderRadius: 20, padding: 20, borderWidth: 1, alignItems: "center", marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4 },
    avatarImage: { width: 88, height: 88, borderRadius: 44, marginBottom: 10 },
    avatarCircleSurface: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 10 },
    avatarInitialLabel: { color: "#fff", fontSize: 32, fontWeight: "700" },
    availabilityIndicatorBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
    pulseStatusDot: { width: 6, height: 6, borderRadius: 3 },
    availabilityBadgeLabel: { fontSize: 11, fontWeight: "600" },
    profileNameHeading: { fontSize: 20, fontWeight: "700", marginBottom: 2 },
    professionalTitleLabel: { fontSize: 13, fontWeight: "400", marginBottom: 8 },
    metadataBriefRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12, flexWrap: "wrap", justifyContent: "center" },
    metadataBriefLabel: { fontSize: 12, fontWeight: "400" },
    ratingNumericVal: { fontSize: 12, fontWeight: "700" },
    biographyTextBody: { fontSize: 13, fontWeight: "400", textAlign: "center", lineHeight: 19, marginBottom: 14, paddingHorizontal: 8 },
    skillsTagCloud: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6 },
    skillTagChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    skillTagLabel: { fontSize: 12, fontWeight: "500" },
    keyPowerStatsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
    individualStatCell: { width: "47%", borderRadius: 14, padding: 14, borderWidth: 1, alignItems: "center", gap: 4 },
    statValueLabel: { fontSize: 18, fontWeight: "700" },
    statContextLabel: { fontSize: 11, fontWeight: "500" },
    sectionHeadingText: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
    portfolioDisplayGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
    portfolioGalleryItem: { width: "47%", aspectRatio: 1, borderRadius: 16, alignItems: "center", justifyContent: "center", overflow: "hidden" },
    portfolioTitleOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0,0,0,0.55)",
        padding: 8,
    },
    portfolioTitleText: { color: "#fff", fontSize: 11, fontWeight: "600" },
    peerReviewCard: { borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 10 },
    reviewHeaderContext: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
    reviewAuthorAvatarDisk: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    reviewAuthorInitial: { color: "#fff", fontSize: 14, fontWeight: "700" },
    reviewAuthorNameLabel: { fontSize: 13, fontWeight: "600", marginBottom: 2 },
    starsDisplayRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
    reviewAgeLabel: { fontSize: 11, fontWeight: "400" },
    reviewBodyCopy: { fontSize: 13, fontWeight: "400", lineHeight: 19 },
    bottomConversionBar: { flexDirection: "row", padding: 16, gap: 12, borderTopWidth: 1, position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10 },
    secondaryContactActionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderWidth: 1.5, borderRadius: 14, paddingVertical: 14 },
    secondaryContactLabel: { fontSize: 15, fontWeight: "600" },
    primaryHireActionBtn: { flex: 2, borderRadius: 14, paddingVertical: 14, alignItems: "center", justifyContent: "center" },
    primaryHireActionLabel: { fontSize: 15, fontWeight: "700" },
});
