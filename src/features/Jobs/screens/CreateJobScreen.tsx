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
    StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useColors } from "@/hooks/useColors";

/**
 * CreateJobScreen allows requesters to post new project requirements.
 * Modernized with a brand-consistent header, focused input groups, and premium form elements.
 */
export default function CreateJobScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [budget, setBudget] = useState("");
    const [budgetType, setBudgetType] = useState<"fixed" | "hourly">("fixed");
    const [deadline, setDeadline] = useState("");
    const [hasAttachment, setHasAttachment] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const topInsetOffset = Platform.OS === "ios" ? insets.top : 20;

    const handlePreview = () => {
        if (!title.trim() || !description.trim() || !budget.trim()) return;
        navigation.navigate("JobPreview", { title, description, budget, budgetType, deadline });
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

            {/* Immersive Brand Header */}
            <View style={[styles.headerSolid, { backgroundColor: colors.primary, paddingTop: topInsetOffset + 6 }]}>
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <Feather name="arrow-left" size={22} color="#fff" />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: '#fff' }]}>Post Your Job</Text>
                    <TouchableOpacity
                        style={[styles.previewBtn, { backgroundColor: title.trim() ? "#fff" : "rgba(255,255,255,0.2)" }]}
                        onPress={handlePreview}
                        disabled={!title.trim()}
                    >
                        <Text style={[styles.previewLabel, { color: title.trim() ? colors.primary : "rgba(255,255,255,0.6)" }]}>Preview</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={[styles.scrollPadding, { paddingBottom: 60 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Visual Step Indicator (Premium Touch) */}
                <View style={styles.stepperContainer}>
                    {[1, 2, 3].map(i => (
                        <React.Fragment key={i}>
                            <View style={[styles.stepCircle, { backgroundColor: i <= 2 ? colors.primary : colors.muted }]}>
                                <Text style={styles.stepNum}>{i}</Text>
                            </View>
                            {i < 3 && <View style={[styles.stepLine, { backgroundColor: i < 2 ? colors.primary : colors.muted }]} />}
                        </React.Fragment>
                    ))}
                </View>

                {/* Section: Project Branding */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="create-outline" size={20} color={colors.primary} />
                        <Text style={[styles.cardTitle, { color: colors.foreground }]}>Define Requirements</Text>
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Main Headline*</Text>
                        <TextInput
                            style={[styles.inputBox, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                            placeholder="e.g. Flutter Developer for Logistics Dashboard"
                            placeholderTextColor={colors.mutedForeground}
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Detailed Description*</Text>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                            placeholder="Briefly describe the key tasks, required tech stack, and expected deliverables..."
                            placeholderTextColor={colors.mutedForeground}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            maxLength={1000}
                        />
                        <Text style={[styles.counter, { color: colors.mutedForeground }]}>{description.length}/1000</Text>
                    </View>
                </View>

                {/* Section: Commercials */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="wallet-outline" size={20} color={colors.primary} />
                        <Text style={[styles.cardTitle, { color: colors.foreground }]}>Budget & Rates</Text>
                    </View>

                    <View style={styles.selectorRow}>
                        {(["fixed", "hourly"] as const).map(type => (
                            <TouchableOpacity
                                key={type}
                                style={[styles.selectorBtn, {
                                    backgroundColor: budgetType === type ? colors.primary : colors.background,
                                    borderColor: budgetType === type ? colors.primary : colors.border,
                                }]}
                                onPress={() => setBudgetType(type)}
                            >
                                <Text style={[styles.selectorLabel, { color: budgetType === type ? "#fff" : colors.mutedForeground }]}>
                                    {type === "fixed" ? "Milestone-Based" : "Time & Material"}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
                            {budgetType === "fixed" ? "Estimated Budget*" : "Internal Rate Scale*"}
                        </Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                            <Text style={[styles.symbol, { color: colors.primary }]}>$</Text>
                            <TextInput
                                style={[styles.numInput, { color: colors.foreground }]}
                                placeholder={budgetType === "fixed" ? "5,000" : "85"}
                                placeholderTextColor={colors.mutedForeground}
                                value={budget}
                                onChangeText={setBudget}
                                keyboardType="numeric"
                            />
                            {budgetType === "hourly" && <Text style={[styles.unit, { color: colors.mutedForeground }]}>/hr</Text>}
                        </View>
                    </View>
                </View>

                {/* Section: Logistics */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                        <Text style={[styles.cardTitle, { color: colors.foreground }]}>Timeline & Extras</Text>
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Submission Deadline</Text>
                        <View style={[styles.iconInput, { backgroundColor: colors.background, borderColor: colors.border }]}>
                            <Ionicons name="time-outline" size={18} color={colors.mutedForeground} />
                            <TextInput
                                style={[styles.iconText, { color: colors.foreground }]}
                                placeholder="Choose a date (e.g. 25 Oct, 2025)"
                                placeholderTextColor={colors.mutedForeground}
                                value={deadline}
                                onChangeText={setDeadline}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.uploadBox, {
                            borderColor: hasAttachment ? colors.primary : colors.border,
                            backgroundColor: hasAttachment ? colors.blueLight : colors.background,
                            borderStyle: "dashed",
                        }]}
                        onPress={() => setHasAttachment(!hasAttachment)}
                    >
                        <Feather name={hasAttachment ? "file-text" : "upload-cloud"} size={24} color={hasAttachment ? colors.primary : colors.mutedForeground} />
                        <View>
                            <Text style={[styles.uploadLabel, { color: hasAttachment ? colors.primary : colors.foreground }]}>
                                {hasAttachment ? "Strategy_Doc.pdf" : "Upload Guidelines"}
                            </Text>
                            <Text style={[styles.uploadSub, { color: colors.mutedForeground }]}>Max file size: 10MB</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.submitBtn, { backgroundColor: title.trim() && description.trim() && budget.trim() ? colors.primary : colors.muted }]}
                    onPress={() => {
                        setIsSubmitting(true);
                        setTimeout(() => {
                            setIsSubmitting(false);
                            handlePreview();
                        }, 500);
                    }}
                    disabled={!title.trim() || !description.trim() || !budget.trim()}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.submitLabel, { color: title.trim() && description.trim() && budget.trim() ? "#fff" : colors.mutedForeground }]}>
                        {isSubmitting ? "Finalizing..." : "Review Project Brief"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerSolid: { width: '100%', paddingBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    headerContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 10 },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    previewBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
    previewLabel: { fontSize: 13, fontWeight: '700' },
    scrollPadding: { paddingHorizontal: 16, paddingTop: 20 },
    stepperContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 24 },
    stepCircle: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
    stepNum: { color: "#fff", fontSize: 13, fontWeight: '700' },
    stepLine: { width: 40, height: 2, marginHorizontal: 4 },
    card: { borderRadius: 20, padding: 20, borderWidth: 1, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
    cardHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 18 },
    cardTitle: { fontSize: 16, fontWeight: '700' },
    fieldGroup: { marginBottom: 16 },
    fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
    inputBox: { height: 50, borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 14, fontSize: 15 },
    textArea: { minHeight: 120, borderRadius: 12, borderWidth: 1.5, padding: 14, fontSize: 15, textAlignVertical: "top", lineHeight: 22 },
    counter: { fontSize: 10, fontWeight: '400', alignSelf: "flex-end", marginTop: 4 },
    selectorRow: { flexDirection: "row", gap: 12, marginBottom: 18 },
    selectorBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, alignItems: "center" },
    selectorLabel: { fontSize: 13, fontWeight: '600' },
    inputWrapper: { flexDirection: "row", alignItems: "center", height: 50, borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 14, gap: 8 },
    symbol: { fontSize: 18, fontWeight: '700' },
    numInput: { flex: 1, fontSize: 18, fontWeight: '700' },
    unit: { fontSize: 14, fontWeight: '500' },
    iconInput: { flexDirection: "row", alignItems: "center", height: 50, borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 14, gap: 10 },
    iconText: { flex: 1, fontSize: 15 },
    uploadBox: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 14, borderWidth: 2 },
    uploadLabel: { fontSize: 14, fontWeight: '600' },
    uploadSub: { fontSize: 11, fontWeight: '400' },
    submitBtn: { height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center", marginTop: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
    submitLabel: { fontSize: 16, fontWeight: '700' },
});
