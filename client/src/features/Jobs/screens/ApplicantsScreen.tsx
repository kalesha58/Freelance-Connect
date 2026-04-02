import React, { useEffect, useState } from "react";
import {
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

/**
 * Type for Applicants route parameters.
 */
type ApplicantsRouteProp = RouteProp<{ Applicants: { jobId: string; jobTitle: string } }, 'Applicants'>;


/**
 * ApplicantsScreen allows hiring partners to review proposals for their posted jobs.
 * CLI-optimised list with quick actions for hiring or declining candidates.
 */
export default function ApplicantsScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const route = useRoute<ApplicantsRouteProp>();
    const { jobId, jobTitle } = route.params || { jobId: "", jobTitle: "Project Title" };
    const { fetchApplicants, updateApplicationStatus } = useApp();

    const [applicants, setApplicants] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const topInsetOffset = Platform.OS === "ios" ? insets.top : 20;

    useEffect(() => {
        loadApplicants();
    }, [jobId]);

    const loadApplicants = async () => {
        if (!jobId) return;
        try {
            const data = await fetchApplicants(jobId);
            setApplicants(data);
        } catch (error) {
            console.error("Load Applicants Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (applicationId: string, status: 'hired' | 'rejected') => {
        try {
            await updateApplicationStatus(applicationId, status);
            loadApplicants(); // Refresh list
        } catch (error) {
            Alert.alert("Error", "Updating status failed: " + error);
        }
    };

    return (
        <View style={[styles.applicantsRoot, { backgroundColor: colors.background }]}>
            <View style={[styles.stickyHeader, { paddingTop: topInsetOffset + 6, borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.circularNavBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => navigation.goBack()}
                >
                    <Feather name="arrow-left" size={20} color={colors.foreground} />
                </TouchableOpacity>
                <View style={{ flex: 1, marginHorizontal: 12 }}>
                    <Text style={[styles.headerHeading, { color: colors.foreground }]}>Applicants</Text>
                    <Text style={[styles.headerContextLabel, { color: colors.mutedForeground }]} numberOfLines={1}>{jobTitle}</Text>
                </View>
                <View style={[styles.totalCountBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.totalCountVal}>{applicants.length}</Text>
                </View>
            </View>

            <FlatList
                data={applicants}
                keyExtractor={item => item._id}
                contentContainerStyle={[styles.applicantListArea, { paddingBottom: 40 }]}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <View style={[styles.proposalCardSurface, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.proposalCardHeader}>
                            <TouchableOpacity
                                style={[styles.proposalAvatarCircle, { backgroundColor: colors.primary }]}
                                onPress={() => navigation.navigate("FreelancerProfile", { id: item.applicantId })}
                            >
                                {item.applicantAvatar ? (
                                    <View /> // Placeholder for real avatar
                                ) : (
                                    <Text style={styles.proposalAvatarInitials}>{item.applicantName?.charAt(0)}</Text>
                                )}
                            </TouchableOpacity>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.candidateNameLabel, { color: colors.foreground }]}>{item.applicantName}</Text>
                                <Text style={[styles.candidateProfessionalTitle, { color: colors.mutedForeground }]}>{item.status.toUpperCase()}</Text>
                                <View style={styles.ratingInfoRow}>
                                    <Ionicons name="star" size={12} color={colors.warning} />
                                    <Text style={[styles.ratingValCopy, { color: colors.foreground }]}>4.9</Text>
                                    <Text style={[styles.reviewsCountCopy, { color: colors.mutedForeground }]}>(Placeholder)</Text>
                                </View>
                            </View>
                            <View style={styles.bidContextBox}>
                                <Text style={[styles.bidValueLabel, { color: colors.primary }]}>{item.status === 'hired' ? 'HIRED' : ''}</Text>
                                <Text style={[styles.submissionAgeLabel, { color: colors.mutedForeground }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                            </View>
                        </View>

                        <View style={[styles.pitchTextContainer, { backgroundColor: colors.muted }]}>
                            <Text style={[styles.proposalHeadingLabel, { color: colors.mutedForeground }]}>Proposal</Text>
                            <Text style={[styles.proposalBodyText, { color: colors.foreground }]} numberOfLines={3}>{item.coverLetter || "No cover letter provided."}</Text>
                        </View>

                        {item.status === 'pending' && (
                            <View style={styles.proposalActionsRow}>
                                <TouchableOpacity
                                    style={[styles.declineActionBtn, { borderColor: colors.destructive + "60" }]}
                                    activeOpacity={0.8}
                                    onPress={() => handleUpdateStatus(item._id, 'rejected')}
                                >
                                    <Feather name="x" size={16} color={colors.destructive} />
                                    <Text style={[styles.declineActionLabel, { color: colors.destructive }]}>Decline</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.reviewProfileBtn, { borderColor: colors.border }]}
                                    onPress={() => navigation.navigate("FreelancerProfile", { id: item.applicantId })}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.reviewProfileLabel, { color: colors.foreground }]}>View Profile</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.acceptHireBtn, { backgroundColor: colors.success }]}
                                    onPress={() => handleUpdateStatus(item._id, 'hired')}
                                    activeOpacity={0.8}
                                >
                                    <Feather name="check" size={16} color="#fff" />
                                    <Text style={styles.acceptHireLabel}>Hire</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    applicantsRoot: { flex: 1 },
    stickyHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
    circularNavBtn: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
    headerHeading: { fontSize: 16, fontWeight: '700' },
    headerContextLabel: { fontSize: 12, fontWeight: '400' },
    totalCountBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    totalCountVal: { color: "#fff", fontSize: 13, fontWeight: '700' },
    applicantListArea: { padding: 16, gap: 12 },
    proposalCardSurface: { borderRadius: 16, padding: 16, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    proposalCardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 12 },
    proposalAvatarCircle: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
    proposalAvatarInitials: { color: "#fff", fontSize: 20, fontWeight: '700' },
    candidateNameLabel: { fontSize: 15, fontWeight: '700', marginBottom: 1 },
    candidateProfessionalTitle: { fontSize: 12, fontWeight: '400', marginBottom: 3 },
    ratingInfoRow: { flexDirection: "row", alignItems: "center", gap: 3 },
    ratingValCopy: { fontSize: 12, fontWeight: '700' },
    reviewsCountCopy: { fontSize: 11, fontWeight: '400' },
    bidContextBox: { alignItems: "flex-end" },
    bidValueLabel: { fontSize: 16, fontWeight: '700' },
    submissionAgeLabel: { fontSize: 11, fontWeight: '400', marginTop: 2 },
    pitchTextContainer: { borderRadius: 10, padding: 12, marginBottom: 12 },
    proposalHeadingLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
    proposalBodyText: { fontSize: 13, fontWeight: '400', lineHeight: 19 },
    proposalActionsRow: { flexDirection: "row", gap: 8 },
    declineActionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, borderWidth: 1.5, borderRadius: 10, paddingVertical: 9 },
    declineActionLabel: { fontSize: 13, fontWeight: '600' },
    reviewProfileBtn: { flex: 1.2, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderRadius: 10, paddingVertical: 9 },
    reviewProfileLabel: { fontSize: 13, fontWeight: '600' },
    acceptHireBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, borderRadius: 10, paddingVertical: 9 },
    acceptHireLabel: { color: "#fff", fontSize: 13, fontWeight: '600' },
});
