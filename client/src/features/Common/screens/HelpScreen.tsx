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
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";

import { useColors } from "@/hooks/useColors";

const FAQS = [
    { q: "How do I delete my account or data?", a: "Open Settings, tap Request account deletion, then send us an email using the button (subject: Data Deletion Request). We process valid requests within 30 days, except where the law requires keeping certain records. This applies to freelancers and hiring partners alike." },
    { q: "How do I apply to a job?", a: "Browse the job feed, tap on any job listing, and press 'Apply Now'. You can include a cover letter and your portfolio link." },
    { q: "How does the payment process work?", a: "Payments are held in escrow when a job starts. Funds are released to you once the client approves your work. Freelance Connect charges a 10% platform fee." },
    { q: "How do I unlock more client chats?", a: "Free accounts can message up to 3 clients. Upgrade to Tasker Pro for unlimited messaging, plus priority job placement and advanced analytics." },
    { q: "Can I work as both a Freelancer and Requester?", a: "Yes! You can switch roles from your profile settings at any time. Your work history and profile are maintained for each role." },
    { q: "How are freelancers verified?", a: "We verify identity via government ID and conduct skill assessments. Verified badges appear on profiles for added trust." },
];

/**
 * HelpScreen provides users with documentation, FAQs, and support channels.
 * Designed for self-service problem resolution.
 */
export default function HelpScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    const topInsetOffset = Platform.OS === "ios" ? insets.top : 20;

    return (
        <View style={[styles.helpRoot, { backgroundColor: colors.background }]}>
            <View style={[styles.helpHeaderBar, { paddingTop: topInsetOffset + 6, borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.circularNavBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => navigation.goBack()}
                >
                    <Feather name="arrow-left" size={20} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerHeadingLabel, { color: colors.foreground }]}>Help & Support</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={[styles.helpContentArea, { paddingBottom: 40 }]} showsVerticalScrollIndicator={false}>
                <View style={[styles.heroContextCard, { backgroundColor: colors.navyDeep }]}>
                    <Feather name="help-circle" size={32} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.heroHeadingTitle}>How can we help?</Text>
                    <Text style={styles.heroSubDescription}>Browse FAQs or contact our support team</Text>
                </View>

                <Text style={[styles.sectionHeadingTitle, { color: colors.foreground }]}>Frequently Asked Questions</Text>
                {FAQS.map((faq, i) => (
                    <TouchableOpacity
                        key={i}
                        style={[styles.faqAccordionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                        activeOpacity={0.85}
                    >
                        <View style={styles.faqHeaderSummary}>
                            <Text style={[styles.faqQuestionText, { color: colors.foreground }]}>{faq.q}</Text>
                            <Feather
                                name={openFaqIndex === i ? "chevron-up" : "chevron-down"}
                                size={18}
                                color={colors.mutedForeground}
                            />
                        </View>
                        {openFaqIndex === i && (
                            <Text style={[styles.faqAnswerBody, { color: colors.mutedForeground }]}>{faq.a}</Text>
                        )}
                    </TouchableOpacity>
                ))}

                <Text style={[styles.sectionHeadingTitle, { color: colors.foreground }]}>Contact Support</Text>
                <View style={styles.supportChannelsRow}>
                    {[
                        { icon: "message-circle" as const, label: "Live Chat", sub: "Typically replies in minutes", color: colors.primary },
                        { icon: "mail" as const, label: "Email Us", sub: "kaleshabox8@gmail.com", color: colors.purpleAccent },
                    ].map(item => (
                        <TouchableOpacity
                            key={item.label}
                            style={[styles.supportChannelCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                            activeOpacity={0.85}
                        >
                            <View style={[styles.channelIconSurface, { backgroundColor: item.color + "18" }]}>
                                <Feather name={item.icon} size={22} color={item.color} />
                            </View>
                            <Text style={[styles.channelPrimaryLabel, { color: colors.foreground }]}>{item.label}</Text>
                            <Text style={[styles.channelSecondaryLabel, { color: colors.mutedForeground }]}>{item.sub}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    helpRoot: { flex: 1 },
    helpHeaderBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
    circularNavBtn: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
    headerHeadingLabel: { fontSize: 18, fontWeight: '700' },
    helpContentArea: { padding: 16, gap: 12 },
    heroContextCard: { borderRadius: 20, padding: 24, alignItems: "center", gap: 8, marginBottom: 6 },
    heroHeadingTitle: { color: "#fff", fontSize: 20, fontWeight: '700' },
    heroSubDescription: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: '400' },
    sectionHeadingTitle: { fontSize: 17, fontWeight: '700', marginTop: 4 },
    faqAccordionCard: { borderRadius: 14, padding: 16, borderWidth: 1 },
    faqHeaderSummary: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
    faqQuestionText: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },
    faqAnswerBody: { fontSize: 13, fontWeight: '400', lineHeight: 19, marginTop: 10 },
    supportChannelsRow: { flexDirection: "row", gap: 12 },
    supportChannelCard: { flex: 1, borderRadius: 14, padding: 16, borderWidth: 1, alignItems: "center", gap: 6 },
    channelIconSurface: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    channelPrimaryLabel: { fontSize: 14, fontWeight: '700' },
    channelSecondaryLabel: { fontSize: 11, fontWeight: '400', textAlign: "center" },
});
