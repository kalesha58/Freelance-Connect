import React, { useState } from "react";
import {
    Platform,
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
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat/KeyboardAwareScrollViewCompat";

/**
 * CreateJobScreen allows requesters to post new project requirements.
 * Optimized with KeyboardAwareScrollViewCompat for robust keyboard handling.
 */
export default function CreateJobScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [budget, setBudget] = useState("");
    const [budgetType, setBudgetType] = useState<"fixed" | "hourly">("fixed");
    const [category, setCategory] = useState("Mobile Dev");
    const [deadline, setDeadline] = useState("");
    const [location, setLocation] = useState("Remote");
    const [hasAttachment, setHasAttachment] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const topInsetOffset = Platform.OS === "ios" ? insets.top : 20;

    const handlePreview = () => {
        if (!title.trim() || !description.trim() || !budget.trim()) return;
        navigation.navigate("JobPreview", { 
            title, 
            description, 
            budget, 
            budgetType, 
            deadline, 
            category,
            location,
            isRemote: location.toLowerCase() === 'remote'
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor={colors.headerBackground} />

            {/* Immersive Brand Header */}
            <View style={[styles.headerSolid, { backgroundColor: colors.headerBackground, paddingTop: topInsetOffset + 6 }]}>
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
                        <Text style={[styles.previewLabel, { color: title.trim() ? colors.headerBackground : "rgba(255,255,255,0.6)" }]}>Preview</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <KeyboardAwareScrollViewCompat
                contentContainerStyle={[styles.scrollPadding, { paddingBottom: 60 + insets.bottom }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Visual Step Indicator (Premium Touch) */}
                <View style={styles.stepperContainer}>
                    {[1, 2, 3].map(i => {
                        const isCompleted = i < 1; // Step 1 is starting
                        const isActive = i === 1;
                        return (
                            <React.Fragment key={i}>
                                <View style={[
                                    styles.stepCircle,
                                    {
                                        backgroundColor: isActive ? colors.headerBackground : (isCompleted ? colors.headerBackground : colors.background),
                                        borderColor: isActive || isCompleted ? colors.headerBackground : colors.border,
                                        borderWidth: 2
                                    }
                                ]}>
                                    <Text style={[styles.stepNum, { color: isActive || isCompleted ? "#fff" : colors.mutedForeground }]}>{i}</Text>
                                </View>
                                {i < 3 && (
                                    <View style={[
                                        styles.stepLine,
                                        { backgroundColor: i < 1 ? colors.headerBackground : colors.border }
                                    ]} />
                                )}
                            </React.Fragment>
                        );
                    })}
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

                    <View style={styles.fieldGroup}>
                        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Category*</Text>
                        <TextInput
                            style={[styles.inputBox, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                            placeholder="e.g. Design, Mobile Dev, Backend"
                            placeholderTextColor={colors.mutedForeground}
                            value={category}
                            onChangeText={setCategory}
                        />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Location*</Text>
                        <TextInput
                            style={[styles.inputBox, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                            placeholder="e.g. Remote, New York, London"
                            placeholderTextColor={colors.mutedForeground}
                            value={location}
                            onChangeText={setLocation}
                        />
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
                                    backgroundColor: budgetType === type ? colors.buttonPrimary : colors.background,
                                    borderColor: budgetType === type ? colors.buttonPrimary : colors.border,
                                }]}
                                onPress={() => setBudgetType(type)}
                            >
                                <Text style={[styles.selectorLabel, { color: budgetType === type ? colors.onButtonPrimary : colors.mutedForeground }]}>
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
                            <Text style={[styles.symbol, { color: colors.primary }]}>₹</Text>
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
                    style={[styles.submitBtn, { backgroundColor: title.trim() && description.trim() && budget.trim() ? colors.buttonPrimary : colors.muted }]}
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
                    <Text style={[styles.submitLabel, { color: title.trim() && description.trim() && budget.trim() ? colors.onButtonPrimary : colors.mutedForeground }]}>
                        {isSubmitting ? "Finalizing..." : "Review Project Brief"}
                    </Text>
                </TouchableOpacity>
            </KeyboardAwareScrollViewCompat>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerSolid: { width: '100%', paddingBottom: 16, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
    headerContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 10 },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    previewBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
    previewLabel: { fontSize: 12, fontWeight: '700' },
    scrollPadding: { paddingHorizontal: 14, paddingTop: 16 },
    stepperContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 20 },
    stepCircle: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
    stepNum: { color: "#fff", fontSize: 12, fontWeight: '700' },
    stepLine: { width: 30, height: 2, marginHorizontal: 4 },
    card: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
    cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
    cardTitle: { fontSize: 14, fontWeight: '700' },
    fieldGroup: { marginBottom: 12 },
    fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
    inputBox: { height: 44, borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 12, fontSize: 14 },
    textArea: { minHeight: 100, borderRadius: 10, borderWidth: 1.5, padding: 12, fontSize: 14, textAlignVertical: "top", lineHeight: 20 },
    counter: { fontSize: 9, fontWeight: '400', alignSelf: "flex-end", marginTop: 4 },
    selectorRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
    selectorBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, alignItems: "center" },
    selectorLabel: { fontSize: 12, fontWeight: '600' },
    inputWrapper: { flexDirection: "row", alignItems: "center", height: 44, borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 12, gap: 6 },
    symbol: { fontSize: 16, fontWeight: '700' },
    numInput: { flex: 1, fontSize: 16, fontWeight: '700' },
    unit: { fontSize: 13, fontWeight: '500' },
    iconInput: { flexDirection: "row", alignItems: "center", height: 44, borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 12, gap: 8 },
    iconText: { flex: 1, fontSize: 14 },
    uploadBox: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1.5 },
    uploadLabel: { fontSize: 13, fontWeight: '600' },
    uploadSub: { fontSize: 10, fontWeight: '400' },
    submitBtn: { height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 },
    submitLabel: { fontSize: 15, fontWeight: '700' },
});
