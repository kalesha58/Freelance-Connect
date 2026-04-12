import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";

import { useColors } from "@/hooks/useColors";

const REASONS = [
    "Spam or misleading content",
    "Inappropriate behavior",
    "Fraudulent activity",
    "Fake profile or impersonation",
    "Harassment or threats",
    "Other",
];

/**
 * ReportScreen provides users with a safety reporting mechanism.
 * Standardizes violation reporting and optional user blocking.
 */
export default function ReportScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();

    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [details, setDetails] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const topInsetOffset = Platform.OS === "ios" ? insets.top : 20;

    const handleReportSubmission = () => {
        if (!selectedReason) return;
        setIsSubmitted(true);
        setTimeout(() => navigation.goBack(), 2000);
    };

    if (isSubmitted) {
        return (
            <View style={[styles.successRoot, { backgroundColor: colors.background }]}>
                <View style={[styles.successIconSurface, { backgroundColor: colors.success + "18" }]}>
                    <Feather name="check-circle" size={48} color={colors.success} />
                </View>
                <Text style={[styles.successHeadingTitle, { color: colors.foreground }]}>Report Submitted</Text>
                <Text style={[styles.successContextDescription, { color: colors.mutedForeground }]}>
                    Thank you for helping keep Skill Link safe. We will review your report within 24 hours.
                </Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={[styles.reportFormRoot, { backgroundColor: colors.background }]}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={[styles.reportHeaderBar, { paddingTop: topInsetOffset + 6, borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.circularNavBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => navigation.goBack()}
                >
                    <Feather name="arrow-left" size={20} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.reportHeaderHeading, { color: colors.foreground }]}>Report / Block</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={[styles.reportScrollArea, { paddingBottom: 100 }]} showsVerticalScrollIndicator={false}>
                <View style={[styles.policyWarningBanner, { backgroundColor: colors.warning + "15", borderColor: colors.warning + "30" }]}>
                    <Feather name="alert-triangle" size={18} color={colors.warning} />
                    <Text style={[styles.policyWarningText, { color: colors.warning }]}>
                        False reports may result in account suspension. Please only report genuine violations.
                    </Text>
                </View>

                <Text style={[styles.sectionHeadingTitle, { color: colors.foreground }]}>Reason for Report</Text>
                {REASONS.map(reason => (
                    <TouchableOpacity
                        key={reason}
                        style={[styles.reasonOptionRow, {
                            backgroundColor: selectedReason === reason ? colors.destructive + "10" : colors.card,
                            borderColor: selectedReason === reason ? colors.destructive + "50" : colors.border,
                        }]}
                        onPress={() => setSelectedReason(reason)}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.radioTargetOuter, { borderColor: selectedReason === reason ? colors.destructive : colors.border }]}>
                            {selectedReason === reason && <View style={[styles.radioTargetInner, { backgroundColor: colors.destructive }]} />}
                        </View>
                        <Text style={[styles.reasonContentLabel, { color: colors.foreground }]}>{reason}</Text>
                    </TouchableOpacity>
                ))}

                <Text style={[styles.sectionHeadingTitle, { color: colors.foreground }]}>Additional Details</Text>
                <TextInput
                    style={[styles.reportDetailsTextArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                    placeholder="Provide any additional context (optional)..."
                    placeholderTextColor={colors.mutedForeground}
                    value={details}
                    onChangeText={setDetails}
                    multiline
                    maxLength={500}
                />

                <View style={[styles.userBlockSectionRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.blockTitleHeader, { color: colors.foreground }]}>Block this user</Text>
                        <Text style={[styles.blockSecondaryDesc, { color: colors.mutedForeground }]}>They won't be able to contact you or view your profile</Text>
                    </View>
                    <TouchableOpacity style={[styles.actionBlockBtn, { borderColor: colors.destructive }]}>
                        <Text style={[styles.actionBlockBtnLabel, { color: colors.destructive }]}>Block</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.submitReportActionBtn, { backgroundColor: selectedReason ? colors.destructive : colors.muted }]}
                    onPress={handleReportSubmission}
                    disabled={!selectedReason}
                    activeOpacity={0.85}
                >
                    <Feather name="flag" size={16} color={selectedReason ? "#fff" : colors.mutedForeground} />
                    <Text style={[styles.submitReportActionLabel, { color: selectedReason ? "#fff" : colors.mutedForeground }]}>Submit Report</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    reportFormRoot: { flex: 1 },
    successRoot: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 16 },
    successIconSurface: { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center" },
    successHeadingTitle: { fontSize: 22, fontWeight: '700' },
    successContextDescription: { fontSize: 14, fontWeight: '400', textAlign: "center", lineHeight: 21 },
    reportHeaderBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
    circularNavBtn: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
    reportHeaderHeading: { fontSize: 18, fontWeight: '700' },
    reportScrollArea: { padding: 16, gap: 14 },
    policyWarningBanner: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: "flex-start" },
    policyWarningText: { flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 18 },
    sectionHeadingTitle: { fontSize: 16, fontWeight: '700', marginTop: 4 },
    reasonOptionRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 12, borderWidth: 1 },
    radioTargetOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
    radioTargetInner: { width: 10, height: 10, borderRadius: 5 },
    reasonContentLabel: { fontSize: 14, fontWeight: '600', flex: 1 },
    reportDetailsTextArea: { borderRadius: 14, borderWidth: 1.5, padding: 14, fontSize: 14, fontWeight: '400', minHeight: 100, textAlignVertical: "top", lineHeight: 21 },
    userBlockSectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderRadius: 14, borderWidth: 1 },
    blockTitleHeader: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
    blockSecondaryDesc: { fontSize: 12, fontWeight: '400', flex: 1, marginRight: 10 },
    actionBlockBtn: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
    actionBlockBtnLabel: { fontSize: 13, fontWeight: '700' },
    submitReportActionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 16, paddingVertical: 15 },
    submitReportActionLabel: { fontSize: 16, fontWeight: '700' },
});
