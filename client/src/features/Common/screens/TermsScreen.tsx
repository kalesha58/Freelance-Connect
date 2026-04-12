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
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";

import { useColors } from "@/hooks/useColors";

/**
 * TermsScreen displays the legal documents and privacy policies.
 * High-readability layout for dense procedural content.
 */
export default function TermsScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();

    const topInsetOffset = Platform.OS === "ios" ? insets.top : 20;

    const LEGAL_SECTIONS = [
        {
            title: "1. Acceptance of Terms",
            body: "By accessing or using the Freelance Connect platform, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.",
        },
        {
            title: "2. User Accounts",
            body: "You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.",
        },
        {
            title: "3. Payments & Fees",
            body: "Freelance Connect charges a platform fee of 10% on all completed transactions. Payments are processed through our secure escrow system.",
        },
        {
            title: "4. Intellectual Property",
            body: "All work product created through Freelance Connect projects remains the intellectual property of the hiring client upon full payment.",
        },
        {
            title: "5. Privacy Policy",
            body: "Your privacy is important to us. We collect only the information necessary to provide our services. We do not sell your personal data to third parties.",
        },
        {
            title: "6. Your data and account deletion",
            body:
                "You may request deletion of your account and associated personal data at any time, whether you use Freelance Connect as a freelancer or as a hiring partner. Request deletion in Settings (Request account deletion) or via Help & Support, use the account deletion web page at https://freelance-connect-3uaj.vercel.app/account-deletion-info, or email kaleshabox8@gmail.com with the subject \"Data Deletion Request\". After we receive a valid request, we will remove your account and personal information from our active databases within 30 days, except where the law requires us to keep certain records (for example, tax or accounting).",
        },
        {
            title: "7. Limitation of Liability",
            body: "Freelance Connect is not liable for any indirect, incidental, or consequential damages resulting from your use of the service.",
        },
    ];

    return (
        <View style={[styles.termsRoot, { backgroundColor: colors.background }]}>
            <View style={[styles.termsHeaderBar, { paddingTop: topInsetOffset + 6, borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.circularNavBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => navigation.goBack()}
                >
                    <Feather name="arrow-left" size={20} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerHeadingTitle, { color: colors.foreground }]}>Terms & Privacy</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={[styles.termsContentArea, { paddingBottom: 40 }]} showsVerticalScrollIndicator={false}>
                <View style={[styles.legalSummaryCard, { backgroundColor: colors.blueLight, borderColor: colors.primary + "30" }]}>
                    <Feather name="file-text" size={22} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.summaryPrimaryTitle, { color: colors.primary }]}>Terms of Service & Privacy Policy</Text>
                        <Text style={[styles.summaryRevisionDate, { color: colors.mutedForeground }]}>Last updated: January 1, 2025</Text>
                    </View>
                </View>

                {LEGAL_SECTIONS.map(section => (
                    <View key={section.title} style={styles.legalSectionGroup}>
                        <Text style={[styles.legalSectionHeading, { color: colors.foreground }]}>{section.title}</Text>
                        <Text style={[styles.legalSectionBodyCopy, { color: colors.mutedForeground }]}>{section.body}</Text>
                    </View>
                ))}

                <View style={[styles.supportContactCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.contactPrimaryHeading, { color: colors.foreground }]}>Questions?</Text>
                    <Text style={[styles.contactSecondaryDesc, { color: colors.mutedForeground }]}>
                        If you have any questions about our Terms of Service or Privacy Policy, please contact us at:
                    </Text>
                    <Text style={[styles.contactEmailActionLabel, { color: colors.primary }]}>kaleshabox8@gmail.com</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    termsRoot: { flex: 1 },
    termsHeaderBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
    circularNavBtn: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
    headerHeadingTitle: { fontSize: 18, fontWeight: '700' },
    termsContentArea: { padding: 16, gap: 20 },
    legalSummaryCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
    summaryPrimaryTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
    summaryRevisionDate: { fontSize: 12, fontWeight: '400' },
    legalSectionGroup: { gap: 8 },
    legalSectionHeading: { fontSize: 15, fontWeight: '700' },
    legalSectionBodyCopy: { fontSize: 13, fontWeight: '400', lineHeight: 21 },
    supportContactCard: { borderRadius: 16, padding: 16, borderWidth: 1, alignItems: "center", gap: 8 },
    contactPrimaryHeading: { fontSize: 16, fontWeight: '700' },
    contactSecondaryDesc: { fontSize: 13, fontWeight: '400', textAlign: "center", lineHeight: 19 },
    contactEmailActionLabel: { fontSize: 14, fontWeight: '600' },
});
