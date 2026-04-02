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

import { useColors } from "@/hooks/useColors";

/**
 * Type for Job Preview route parameters.
 */
type JobPreviewRouteProp = RouteProp<{ JobPreview: { title: string; description: string; budget: string; budgetType: string; deadline: string } }, 'JobPreview'>;

/**
 * JobPreviewScreen gives requesters a final look at their posting.
 * Highlights key details before the post is broadcast to the freelancer community.
 */
export default function JobPreviewScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const route = useRoute<JobPreviewRouteProp>();

    const { title, description, budget, budgetType, deadline } = route.params || {
        title: "Project Title", description: "Project Description", budget: "0", budgetType: "fixed", deadline: "Flexible"
    };

    const [isPosting, setIsPosting] = useState(false);
    const topInsetOffset = Platform.OS === "ios" ? insets.top : 20;

    const handlePost = () => {
        setIsPosting(true);
        setTimeout(() => {
            setIsPosting(false);
            navigation.navigate("MyJobs");
        }, 1000);
    };

    return (
        <View style={[styles.previewRootView, { backgroundColor: colors.background }]}>
            <View style={[styles.previewHeaderBar, { paddingTop: topInsetOffset + 6, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={22} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.previewHeaderTextLabel, { color: colors.foreground }]}>Job Preview</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="edit-2" size={20} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={[styles.previewContentArea, { paddingBottom: 120 }]} showsVerticalScrollIndicator={false}>
                <View style={[styles.feedbackBannerRow, { backgroundColor: colors.blueLight, borderColor: colors.primary + "30" }]}>
                    <Feather name="eye" size={16} color={colors.primary} />
                    <Text style={[styles.feedbackBannerCopy, { color: colors.primary }]}>This is how your job will appear to freelancers</Text>
                </View>

                <View style={[styles.simulationJobCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.projectTypeBadge, { backgroundColor: colors.primary + "18" }]}>
                        <Text style={[styles.projectTypeLabel, { color: colors.primary }]}>Full-time / Project</Text>
                    </View>
                    <Text style={[styles.previewJobTitle, { color: colors.foreground }]}>{title || "Untitled Job"}</Text>

                    <View style={styles.metricsSummaryGrid}>
                        {[
                            { icon: "dollar-sign" as const, label: "Budget", value: budget ? `$${budget}${budgetType === "hourly" ? "/hr" : ""}` : "Not set", color: colors.primary },
                            { icon: "calendar" as const, label: "Deadline", value: deadline || "Flexible", color: colors.warning },
                        ].map(item => (
                            <View key={item.label} style={[styles.metricDisplayCell, { backgroundColor: colors.muted }]}>
                                <View style={[styles.metricIconSurface, { backgroundColor: item.color + "18" }]}>
                                    <Feather name={item.icon} size={14} color={item.color} />
                                </View>
                                <Text style={[styles.metricLabelCopy, { color: colors.mutedForeground }]}>{item.label}</Text>
                                <Text style={[styles.metricValueCopy, { color: colors.foreground }]}>{item.value}</Text>
                            </View>
                        ))}
                    </View>

                    <Text style={[styles.descriptionHeaderLabel, { color: colors.foreground }]}>Description</Text>
                    <Text style={[styles.descriptionBodyContext, { color: colors.mutedForeground }]}>{description || "No description provided."}</Text>

                    <View style={[styles.authorAttributionRow, { borderTopColor: colors.border }]}>
                        <View style={[styles.authorAvatarSurface, { backgroundColor: colors.navyMid }]}>
                            <Text style={styles.authorAvatarInitials}>Y</Text>
                        </View>
                        <View>
                            <Text style={[styles.authorRoleLabel, { color: colors.mutedForeground }]}>Posted by</Text>
                            <Text style={[styles.authorNameHeading, { color: colors.foreground }]}>Your Company</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.readinessChecklistCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.checklistHeadingLabel, { color: colors.foreground }]}>Pre-publish checklist</Text>
                    {[
                        { label: "Job title is clear", done: !!title },
                        { label: "Description is detailed", done: (description?.length ?? 0) > 50 },
                        { label: "Budget is set", done: !!budget },
                        { label: "Deadline is specified", done: !!deadline },
                    ].map(item => (
                        <View key={item.label} style={styles.checklistRowItem}>
                            <Feather
                                name={item.done ? "check-circle" : "circle"}
                                size={16}
                                color={item.done ? colors.success : colors.border}
                            />
                            <Text style={[styles.checklistItemText, { color: item.done ? colors.foreground : colors.mutedForeground }]}>
                                {item.label}
                            </Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

            <View style={[styles.bottomConversionActionArea, {
                backgroundColor: colors.card,
                borderTopColor: colors.border,
                paddingBottom: Platform.OS === "ios" ? insets.bottom + 10 : 24,
            }]}>
                <TouchableOpacity
                    style={[styles.secondaryEditActionBtn, { borderColor: colors.border }]}
                    onPress={() => navigation.goBack()}
                >
                    <Feather name="edit-2" size={16} color={colors.foreground} />
                    <Text style={[styles.secondaryEditLabel, { color: colors.foreground }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.primaryPostActionBtn, { backgroundColor: colors.primary, opacity: isPosting ? 0.7 : 1 }]}
                    onPress={handlePost}
                    disabled={isPosting}
                    activeOpacity={0.85}
                >
                    <Feather name="send" size={16} color="#fff" />
                    <Text style={styles.primaryPostActionLabel}>{isPosting ? "Publishing..." : "Post Job"}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    previewRootView: { flex: 1 },
    previewHeaderBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
    previewHeaderTextLabel: { fontSize: 16, fontWeight: '700' },
    previewContentArea: { padding: 16 },
    feedbackBannerRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
    feedbackBannerCopy: { flex: 1, fontSize: 13, fontWeight: '500' },
    simulationJobCard: { borderRadius: 20, padding: 20, borderWidth: 1, marginBottom: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4 },
    projectTypeBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, alignSelf: "flex-start", marginBottom: 10 },
    projectTypeLabel: { fontSize: 11, fontWeight: '600' },
    previewJobTitle: { fontSize: 20, fontWeight: '700', lineHeight: 28, marginBottom: 14 },
    metricsSummaryGrid: { flexDirection: "row", gap: 10, marginBottom: 16 },
    metricDisplayCell: { flex: 1, borderRadius: 12, padding: 12, gap: 4 },
    metricIconSurface: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center", marginBottom: 2 },
    metricLabelCopy: { fontSize: 10, fontWeight: '400' },
    metricValueCopy: { fontSize: 13, fontWeight: '700' },
    descriptionHeaderLabel: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
    descriptionBodyContext: { fontSize: 14, fontWeight: '400', lineHeight: 22, marginBottom: 16 },
    authorAttributionRow: { flexDirection: "row", alignItems: "center", gap: 10, borderTopWidth: 1, paddingTop: 14 },
    authorAvatarSurface: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    authorAvatarInitials: { color: "#fff", fontSize: 15, fontWeight: '700' },
    authorRoleLabel: { fontSize: 11, fontWeight: '400' },
    authorNameHeading: { fontSize: 13, fontWeight: '600' },
    readinessChecklistCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
    checklistHeadingLabel: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
    checklistRowItem: { flexDirection: "row", alignItems: "center", gap: 10 },
    checklistItemText: { fontSize: 13, fontWeight: '500' },
    bottomConversionActionArea: { flexDirection: "row", padding: 16, gap: 12, borderTopWidth: 1, position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10 },
    secondaryEditActionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1.5, borderRadius: 14, paddingVertical: 14 },
    secondaryEditLabel: { fontSize: 15, fontWeight: '600' },
    primaryPostActionBtn: { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14 },
    primaryPostActionLabel: { color: "#fff", fontSize: 15, fontWeight: '700' },
});
