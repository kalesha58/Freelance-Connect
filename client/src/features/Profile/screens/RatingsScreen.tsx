import React from "react";
import {
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useColors } from "@/hooks/useColors";

const REVIEWS = [
    { id: "r1", author: "TechCorp Inc.", rating: 5, comment: "Exceptional work quality and communication throughout the project. Delivered exactly what was promised and on time. Highly recommend!", date: "Nov 2025" },
    { id: "r2", author: "FinStart Solutions", rating: 5, comment: "Professional, talented, and a pleasure to work with. Will definitely hire again for future projects.", date: "Oct 2025" },
    { id: "r3", author: "DataDriven Co.", rating: 4, comment: "Great work overall. A few minor revisions were needed but handled graciously and quickly.", date: "Sep 2025" },
    { id: "r4", author: "HealthTech Pro", rating: 5, comment: "Outstanding! Went above and beyond what was specified. The final product exceeded our expectations.", date: "Aug 2025" },
    { id: "r5", author: "Startup Ventures", rating: 4, comment: "Good work, good communication. Would work with again.", date: "Jul 2025" },
];

const RATING_BREAKDOWN = [5, 4, 3, 2, 1];
const COUNTS = [18, 4, 1, 0, 0];
const TOTAL_REVIEWS_COUNT = COUNTS.reduce((a, b) => a + b, 0);

/**
 * RatingsScreen displays detailed feedback for the user profile.
 * Visualizes rating distribution and individual client reviews.
 */
export default function RatingsScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();

    const topInsetOffset = Platform.OS === "ios" ? insets.top : 20;
    const overallRatingAverage = REVIEWS.reduce((sum, r) => sum + r.rating, 0) / REVIEWS.length;

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

            <FlatList
                data={REVIEWS}
                keyExtractor={item => item.id}
                contentContainerStyle={[styles.reviewsListArea, { paddingBottom: 40 }]}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={() => (
                    <>
                        <View style={[styles.ratingMetricsSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={styles.metricsLeftPanel}>
                                <Text style={[styles.bigRatingValue, { color: colors.foreground }]}>{overallRatingAverage.toFixed(1)}</Text>
                                <View style={styles.starsRepresentationRow}>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Ionicons
                                            key={i}
                                            name={i < Math.round(overallRatingAverage) ? "star" : "star-outline"}
                                            size={18}
                                            color={colors.warning}
                                        />
                                    ))}
                                </View>
                                <Text style={[styles.totalReviewTallyLabel, { color: colors.mutedForeground }]}>{REVIEWS.length} reviews</Text>
                            </View>

                            <View style={styles.metricsRightPanel}>
                                {RATING_BREAKDOWN.map((stars, i) => (
                                    <View key={stars} style={styles.distributionBarRow}>
                                        <Text style={[styles.distStarCountLabel, { color: colors.mutedForeground }]}>{stars}</Text>
                                        <Ionicons name="star" size={11} color={colors.warning} />
                                        <View style={[styles.distBarTrackBackground, { backgroundColor: colors.muted }]}>
                                            <View style={[styles.distBarFillForeground, {
                                                backgroundColor: colors.warning,
                                                width: `${TOTAL_REVIEWS_COUNT > 0 ? (COUNTS[i] / TOTAL_REVIEWS_COUNT) * 100 : 0}%`,
                                            }]} />
                                        </View>
                                        <Text style={[styles.distCountValueLabel, { color: colors.mutedForeground }]}>{COUNTS[i]}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <Text style={[styles.allReviewsContextHeading, { color: colors.foreground }]}>All Reviews</Text>
                    </>
                )}
                renderItem={({ item }) => (
                    <View style={[styles.individualReviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.reviewCardHeader}>
                            <View style={[styles.authorAvatarCircle, { backgroundColor: colors.navyMid }]}>
                                <Text style={styles.authorAvatarInitials}>{item.author.charAt(0)}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.reviewAuthorNameLabel, { color: colors.foreground }]}>{item.author}</Text>
                                <View style={styles.reviewMetaInformationRow}>
                                    <View style={styles.starsTinyRow}>
                                        {Array.from({ length: item.rating }).map((_, i) => (
                                            <Ionicons key={i} name="star" size={12} color={colors.warning} />
                                        ))}
                                    </View>
                                    <Text style={[styles.reviewDateStringLabel, { color: colors.mutedForeground }]}> • {item.date}</Text>
                                </View>
                            </View>
                        </View>
                        <Text style={[styles.reviewCommentaryBodyText, { color: colors.mutedForeground }]}>{item.comment}</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    ratingsRoot: { flex: 1 },
    ratingsHeaderBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
    circularNavBtn: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
    headerHeadingTitle: { fontSize: 18, fontWeight: '700' },
    reviewsListArea: { padding: 16, gap: 12 },
    ratingMetricsSummaryCard: { borderRadius: 20, padding: 20, borderWidth: 1, flexDirection: "row", gap: 16, marginBottom: 6 },
    metricsLeftPanel: { alignItems: "center", gap: 4 },
    bigRatingValue: { fontSize: 48, fontWeight: '700', lineHeight: 56 },
    starsRepresentationRow: { flexDirection: "row", gap: 2 },
    totalReviewTallyLabel: { fontSize: 12, fontWeight: '400' },
    metricsRightPanel: { flex: 1, gap: 6, justifyContent: "center" },
    distributionBarRow: { flexDirection: "row", alignItems: "center", gap: 5 },
    distStarCountLabel: { fontSize: 12, fontWeight: '600', width: 10 },
    distBarTrackBackground: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
    distBarFillForeground: { height: "100%", borderRadius: 3 },
    distCountValueLabel: { fontSize: 11, fontWeight: '400', width: 16, textAlign: "right" },
    allReviewsContextHeading: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
    individualReviewCard: { borderRadius: 14, padding: 14, borderWidth: 1 },
    reviewCardHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
    authorAvatarCircle: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    authorAvatarInitials: { color: "#fff", fontSize: 15, fontWeight: '700' },
    reviewAuthorNameLabel: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
    reviewMetaInformationRow: { flexDirection: "row", alignItems: "center" },
    starsTinyRow: { flexDirection: "row" },
    reviewDateStringLabel: { fontSize: 11, fontWeight: '400' },
    reviewCommentaryBodyText: { fontSize: 13, fontWeight: '400', lineHeight: 19 },
});
