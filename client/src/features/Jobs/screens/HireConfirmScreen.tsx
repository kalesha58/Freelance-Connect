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
import Ionicons from "react-native-vector-icons/Ionicons";

import { useColors } from "@/hooks/useColors";

/**
 * Type for Hire Confirmation route parameters.
 */
type HireConfirmRouteProp = RouteProp<{ HireConfirm: { freelancerId: string } }, 'HireConfirm'>;

const MOCK_FREELANCERS: Record<string, { name: string; title: string; rate: string; rating: number }> = {
    f1: { name: "Sarah Chen", title: "Senior UI/UX Designer", rate: "$95/hr", rating: 4.9 },
    f2: { name: "Marcus Johnson", title: "Full Stack Developer", rate: "$110/hr", rating: 4.8 },
};

/**
 * HireConfirmScreen provides a point of commitment for requesters.
 * Explains the escrow and contract process while finalizing the transaction.
 */
export default function HireConfirmScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const route = useRoute<HireConfirmRouteProp>();
    const { freelancerId } = route.params || { freelancerId: "f1" };

    const [isConfirming, setIsConfirming] = useState(false);
    const [hasConfirmed, setHasConfirmed] = useState(false);

    const freelancer = MOCK_FREELANCERS[freelancerId] ?? MOCK_FREELANCERS["f1"];
    const topInsetOffset = Platform.OS === "ios" ? insets.top : 20;

    const handleConfirm = () => {
        setIsConfirming(true);
        setTimeout(() => {
            setIsConfirming(false);
            setHasConfirmed(true);
        }, 1200);
    };

    if (hasConfirmed) {
        return (
            <View style={[styles.successRootContainer, { backgroundColor: colors.background }]}>
                <View style={[styles.successCardPresentation, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.successIconOuterCircle, { backgroundColor: colors.success + "18" }]}>
                        <Feather name="check-circle" size={56} color={colors.success} />
                    </View>
                    <Text style={[styles.successTitleHeading, { color: colors.foreground }]}>Hire Confirmed!</Text>
                    <Text style={[styles.successDescriptionCopy, { color: colors.mutedForeground }]}>
                        You've successfully hired {freelancer.name}. A notification has been sent and a chat has been opened.
                    </Text>
                    <View style={[styles.confirmationSummaryBox, { backgroundColor: colors.muted }]}>
                        <Text style={[styles.confVendorName, { color: colors.foreground }]}>{freelancer.name}</Text>
                        <Text style={[styles.confVendorTitle, { color: colors.mutedForeground }]}>{freelancer.title}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.primaryChatTransitionBtn, { backgroundColor: colors.primary }]}
                        onPress={() => navigation.navigate("Chat", { id: "conv1" })}
                        activeOpacity={0.85}
                    >
                        <Feather name="message-circle" size={16} color="#fff" />
                        <Text style={styles.chatTransitionBtnLabel}>Open Chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate("Main")}>
                        <Text style={[styles.returnToHomeLabel, { color: colors.mutedForeground }]}>Back to Home</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.hireConfirmationRoot, { backgroundColor: colors.background }]}>
            <View style={[styles.confirmationHeaderBar, { paddingTop: topInsetOffset + 6, borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.circularBackBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => navigation.goBack()}
                >
                    <Feather name="arrow-left" size={20} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.confirmationHeaderTitle, { color: colors.foreground }]}>Confirm Hire</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={[styles.confirmationContentArea, { paddingBottom: 120 }]} showsVerticalScrollIndicator={false}>
                <View style={[styles.hiringTargetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.hiringTargetContext, { color: colors.mutedForeground }]}>You are hiring</Text>
                    <View style={[styles.targetAvatarCircle, { backgroundColor: colors.primary }]}>
                        <Text style={styles.targetAvatarInitials}>{freelancer.name.charAt(0)}</Text>
                    </View>
                    <Text style={[styles.targetProfileName, { color: colors.foreground }]}>{freelancer.name}</Text>
                    <Text style={[styles.targetProfessionalTitle, { color: colors.mutedForeground }]}>{freelancer.title}</Text>
                    <View style={styles.targetRatingLine}>
                        <Ionicons name="star" size={14} color={colors.warning} />
                        <Text style={[styles.targetRatingValue, { color: colors.foreground }]}>{freelancer.rating} rating</Text>
                    </View>
                    <View style={[styles.rateSnapBox, { backgroundColor: colors.blueLight }]}>
                        <Text style={[styles.rateSnapLabel, { color: colors.mutedForeground }]}>Rate</Text>
                        <Text style={[styles.rateSnapValue, { color: colors.primary }]}>{freelancer.rate}</Text>
                    </View>
                </View>

                <View style={[styles.workflowProcessCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.workflowTitleHeading, { color: colors.foreground }]}>What happens next?</Text>
                    {[
                        { step: "1", text: "A contract will be sent to the freelancer for review", icon: "file-text" as const },
                        { step: "2", text: "You'll be connected via chat to discuss details", icon: "message-circle" as const },
                        { step: "3", text: "Work begins once the contract is accepted", icon: "play-circle" as const },
                        { step: "4", text: "Payment is released upon milestone completion", icon: "dollar-sign" as const },
                    ].map(item => (
                        <View key={item.step} style={styles.processStepRow}>
                            <View style={[styles.stepDigitCircle, { backgroundColor: colors.primary }]}>
                                <Text style={styles.stepDigitLabel}>{item.step}</Text>
                            </View>
                            <Feather name={item.icon} size={16} color={colors.mutedForeground} />
                            <Text style={[styles.stepDescriptionText, { color: colors.mutedForeground }]}>{item.text}</Text>
                        </View>
                    ))}
                </View>

                <View style={[styles.safetyTrustBanner, { backgroundColor: colors.navyDeep }]}>
                    <Feather name="shield" size={20} color="#fff" />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.safetyTrustTitle}>Tasker Protection</Text>
                        <Text style={styles.safetyTrustDesc}>Your payment is fully protected. Funds are only released when you approve the work.</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.stickyBottomActionArea, {
                backgroundColor: colors.card,
                borderTopColor: colors.border,
                paddingBottom: Platform.OS === "ios" ? insets.bottom + 10 : 24,
            }]}>
                <TouchableOpacity
                    style={[styles.cancelActionBtn, { borderColor: colors.border }]}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={[styles.cancelActionLabel, { color: colors.foreground }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.primaryConfirmActionBtn, { backgroundColor: colors.success, opacity: isConfirming ? 0.7 : 1 }]}
                    onPress={handleConfirm}
                    disabled={isConfirming}
                    activeOpacity={0.85}
                >
                    <Feather name="check" size={18} color="#fff" />
                    <Text style={styles.confirmActionBtnLabel}>{isConfirming ? "Confirming..." : "Confirm Hire"}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    hireConfirmationRoot: { flex: 1 },
    successRootContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
    successCardPresentation: { width: "100%", borderRadius: 24, padding: 28, borderWidth: 1, alignItems: "center", gap: 14 },
    successIconOuterCircle: { width: 96, height: 96, borderRadius: 32, alignItems: "center", justifyContent: "center" },
    successTitleHeading: { fontSize: 24, fontWeight: '700' },
    successDescriptionCopy: { fontSize: 14, fontWeight: '400', textAlign: "center", lineHeight: 21 },
    confirmationSummaryBox: { width: "100%", borderRadius: 12, padding: 14, alignItems: "center" },
    confVendorName: { fontSize: 16, fontWeight: '700' },
    confVendorTitle: { fontSize: 13, fontWeight: '400' },
    primaryChatTransitionBtn: { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 16, paddingVertical: 15 },
    chatTransitionBtnLabel: { color: "#fff", fontSize: 15, fontWeight: '700' },
    returnToHomeLabel: { fontSize: 13, fontWeight: '500' },
    confirmationHeaderBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
    circularBackBtn: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
    confirmationHeaderTitle: { fontSize: 16, fontWeight: '700' },
    confirmationContentArea: { padding: 16, gap: 14 },
    hiringTargetCard: { borderRadius: 20, padding: 20, borderWidth: 1, alignItems: "center", gap: 6 },
    hiringTargetContext: { fontSize: 12, fontWeight: '600', textTransform: "uppercase", letterSpacing: 0.5 },
    targetAvatarCircle: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginVertical: 6 },
    targetAvatarInitials: { color: "#fff", fontSize: 28, fontWeight: '700' },
    targetProfileName: { fontSize: 20, fontWeight: '700' },
    targetProfessionalTitle: { fontSize: 13, fontWeight: '400' },
    targetRatingLine: { flexDirection: "row", alignItems: "center", gap: 5 },
    targetRatingValue: { fontSize: 14, fontWeight: '600' },
    rateSnapBox: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, marginTop: 4 },
    rateSnapLabel: { fontSize: 13, fontWeight: '400' },
    rateSnapValue: { fontSize: 18, fontWeight: '700' },
    workflowProcessCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 14 },
    workflowTitleHeading: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    processStepRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    stepDigitCircle: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
    stepDigitLabel: { color: "#fff", fontSize: 11, fontWeight: '700' },
    stepDescriptionText: { flex: 1, fontSize: 13, fontWeight: '400', lineHeight: 19 },
    safetyTrustBanner: { flexDirection: "row", gap: 12, padding: 16, borderRadius: 16, alignItems: "flex-start" },
    safetyTrustTitle: { color: "#fff", fontSize: 14, fontWeight: '700', marginBottom: 4 },
    safetyTrustDesc: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: '400', lineHeight: 18 },
    stickyBottomActionArea: { flexDirection: "row", padding: 16, gap: 12, borderTopWidth: 1, position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10 },
    cancelActionBtn: { flex: 1, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderRadius: 14, paddingVertical: 14 },
    cancelActionLabel: { fontSize: 15, fontWeight: '600' },
    primaryConfirmActionBtn: { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14 },
    confirmActionBtnLabel: { color: "#fff", fontSize: 15, fontWeight: '700' },
});
