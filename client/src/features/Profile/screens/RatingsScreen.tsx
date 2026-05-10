import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useColors } from "@/hooks/useColors";
import { apiClient } from "@/utils/apiClient";

interface RawReview {
    _id?: string;
    clientName: string;
    rating: number;
    comment?: string;
    createdAt?: string;
}

interface ReviewsSummary {
    average: number;
    count: number;
    breakdown: Record<"1" | "2" | "3" | "4" | "5", number>;
}

const RATING_BREAKDOWN: Array<5 | 4 | 3 | 2 | 1> = [5, 4, 3, 2, 1];

const formatDate = (iso?: string) => {
    if (!iso) return "";
    try {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return "";
        return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
    } catch {
        return "";
    }
};

/**
 * RatingsScreen displays detailed feedback for the user profile.
 * Pulls real `freelancerReviews` data from /api/reviews/me.
 */
export default function RatingsScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();

    const [reviews, setReviews] = useState<RawReview[]>([]);
    const [summary, setSummary] = useState<ReviewsSummary>({
        average: 0,
        count: 0,
        breakdown: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const topInsetOffset = Platform.OS === "ios" ? insets.top : 20;

    const load = useCallback(async () => {
        try {
            setError(null);
            const data = await apiClient("/reviews/me");
            setSummary(data?.summary || summary);
            setReviews(Array.isArray(data?.reviews) ? data.reviews : []);
        } catch (err: any) {
            console.error("Failed to load reviews", err);
            setError(err?.message || "Could not load reviews.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useFocusEffect(
        useCallback(() => {
            load();
        }, [load])
    );

    const breakdown = summary.breakdown;
    const totalCount = summary.count;
    const average = summary.average;

    const renderReview = ({ item }: { item: RawReview }) => (
        <View style={[styles.individualReviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.reviewCardHeader}>
                <View style={[styles.authorAvatarCircle, { backgroundColor: colors.navyMid }]}>
                    <Text style={styles.authorAvatarInitials}>
                        {(item.clientName || "?").charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.reviewAuthorNameLabel, { color: colors.foreground }]}>
                        {item.clientName || "Client"}
                    </Text>
                    <View style={styles.reviewMetaInformationRow}>
                        <View style={styles.starsTinyRow}>
                            {Array.from({ length: Math.max(0, Math.min(5, item.rating)) }).map((_, i) => (
                                <Ionicons key={i} name="star" size={12} color={colors.warning} />
                            ))}
                        </View>
                        {!!item.createdAt && (
                            <Text style={[styles.reviewDateStringLabel, { color: colors.mutedForeground }]}>
                                {" "}
                                • {formatDate(item.createdAt)}
                            </Text>
                        )}
                    </View>
                </View>
            </View>
            {!!item.comment && (
                <Text style={[styles.reviewCommentaryBodyText, { color: colors.mutedForeground }]}>
                    {item.comment}
                </Text>
            )}
        </View>
    );

    return (
        <View style={[styles.ratingsRoot, { backgroundColor: colors.background }]}>
            <View style={[styles.ratingsHeaderBar, { paddingTop: topInsetOffset + 6, borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.circularNavBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => navigation.goBack()}
                >
                    <Feather name="arrow-left" size={20} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerHeadingTitle, { color: colors.foreground }]}>Ratings & Reviews</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.loadingBlock}>
                    <ActivityIndicator color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={reviews}
                    keyExtractor={(item, index) => String(item._id || `${item.clientName}-${index}`)}
                    contentContainerStyle={[styles.reviewsListArea, { paddingBottom: 40 }]}
                    showsVerticalScrollIndicator={false}
                    refreshing={refreshing}
                    onRefresh={() => {
                        setRefreshing(true);
                        load();
                    }}
                    ListHeaderComponent={() => (
                        <>
                            {error ? (
                                <View style={[styles.errorBanner, { backgroundColor: colors.destructive + "12", borderColor: colors.destructive + "40" }]}>
                                    <Feather name="alert-circle" size={16} color={colors.destructive} />
                                    <Text style={[styles.errorBannerText, { color: colors.destructive }]}>{error}</Text>
                                </View>
                            ) : null}

                            <View style={[styles.ratingMetricsSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={styles.metricsLeftPanel}>
                                    <Text style={[styles.bigRatingValue, { color: colors.foreground }]}>{average.toFixed(1)}</Text>
                                    <View style={styles.starsRepresentationRow}>
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Ionicons
                                                key={i}
                                                name={i < Math.round(average) ? "star" : "star-outline"}
                                                size={18}
                                                color={colors.warning}
                                            />
                                        ))}
                                    </View>
                                    <Text style={[styles.totalReviewTallyLabel, { color: colors.mutedForeground }]}>
                                        {totalCount} review{totalCount === 1 ? "" : "s"}
                                    </Text>
                                </View>

                                <View style={styles.metricsRightPanel}>
                                    {RATING_BREAKDOWN.map((stars) => {
                                        const count = breakdown[String(stars) as "1" | "2" | "3" | "4" | "5"] || 0;
                                        return (
                                            <View key={stars} style={styles.distributionBarRow}>
                                                <Text style={[styles.distStarCountLabel, { color: colors.mutedForeground }]}>{stars}</Text>
                                                <Ionicons name="star" size={11} color={colors.warning} />
                                                <View style={[styles.distBarTrackBackground, { backgroundColor: colors.muted }]}>
                                                    <View style={[styles.distBarFillForeground, {
                                                        backgroundColor: colors.warning,
                                                        width: `${totalCount > 0 ? (count / totalCount) * 100 : 0}%`,
                                                    }]} />
                                                </View>
                                                <Text style={[styles.distCountValueLabel, { color: colors.mutedForeground }]}>{count}</Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>

                            <Text style={[styles.allReviewsContextHeading, { color: colors.foreground }]}>All Reviews</Text>
                        </>
                    )}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyState}>
                            <View style={[styles.emptyIcon, { backgroundColor: colors.primary + "12" }]}>
                                <Feather name="star" size={32} color={colors.primary} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No reviews yet</Text>
                            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
                                Once a client leaves you a review, it will show up here. Keep delivering great work!
                            </Text>
                        </View>
                    )}
                    renderItem={renderReview}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    ratingsRoot: { flex: 1 },
    ratingsHeaderBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 14,
        borderBottomWidth: 1,
    },
    circularNavBtn: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
    headerHeadingTitle: { fontSize: 18, fontWeight: "700" },
    reviewsListArea: { padding: 16, gap: 12 },
    loadingBlock: { flex: 1, alignItems: "center", justifyContent: "center" },
    errorBanner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 6,
    },
    errorBannerText: { flex: 1, fontSize: 12, fontWeight: "600" },
    ratingMetricsSummaryCard: {
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        flexDirection: "row",
        gap: 16,
        marginBottom: 6,
    },
    metricsLeftPanel: { alignItems: "center", gap: 4 },
    bigRatingValue: { fontSize: 48, fontWeight: "700", lineHeight: 56 },
    starsRepresentationRow: { flexDirection: "row", gap: 2 },
    totalReviewTallyLabel: { fontSize: 12, fontWeight: "400" },
    metricsRightPanel: { flex: 1, gap: 6, justifyContent: "center" },
    distributionBarRow: { flexDirection: "row", alignItems: "center", gap: 5 },
    distStarCountLabel: { fontSize: 12, fontWeight: "600", width: 10 },
    distBarTrackBackground: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
    distBarFillForeground: { height: "100%", borderRadius: 3 },
    distCountValueLabel: { fontSize: 11, fontWeight: "400", width: 16, textAlign: "right" },
    allReviewsContextHeading: { fontSize: 17, fontWeight: "700", marginBottom: 4 },
    individualReviewCard: { borderRadius: 14, padding: 14, borderWidth: 1 },
    reviewCardHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
    authorAvatarCircle: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    authorAvatarInitials: { color: "#fff", fontSize: 15, fontWeight: "700" },
    reviewAuthorNameLabel: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
    reviewMetaInformationRow: { flexDirection: "row", alignItems: "center" },
    starsTinyRow: { flexDirection: "row" },
    reviewDateStringLabel: { fontSize: 11, fontWeight: "400" },
    reviewCommentaryBodyText: { fontSize: 13, fontWeight: "400", lineHeight: 19 },

    emptyState: { alignItems: "center", padding: 32, gap: 10, marginTop: 12 },
    emptyIcon: { width: 76, height: 76, borderRadius: 24, alignItems: "center", justifyContent: "center" },
    emptyTitle: { fontSize: 17, fontWeight: "700" },
    emptyDesc: { fontSize: 13, fontWeight: "400", textAlign: "center", lineHeight: 19 },
});
