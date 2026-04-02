import React, { useState } from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    PanResponder,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useColors } from "@/hooks/useColors";

const CATEGORIES = ["Mobile Development", "Web Development", "Design", "Data Science", "Writing", "Marketing"];
const RATINGS = ["Any Rating", "4.5+", "4.0+", "3.5+"];
const LOCATIONS = ["Remote Only", "USA", "Europe", "Asia", "Any Location"];
const BUDGET_STEPS = [0, 25, 50, 75, 100, 150, 200];

/**
 * FilterModal allows users to refine their job or freelancer search.
 * Redesigned for a modern, high-fidelity experience with interactive selectors.
 */
export default function FilterModal() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();

    const [selectedCat, setSelectedCat] = useState<string[]>([]);
    const [budgetMin, setBudgetMin] = useState(0);
    const [budgetMax, setBudgetMax] = useState(6);
    const [selectedRating, setSelectedRating] = useState("Any Rating");
    const [selectedLocation, setSelectedLocation] = useState("Any Location");

    const bottomInsetOffset = Platform.OS === "ios" ? insets.bottom + 10 : 24;
    const topInsetOffset = Platform.OS === "ios" ? insets.top : 20;

    const [sliderWidth, setSliderWidth] = useState(0);
    const startMin = React.useRef(0);
    const startMax = React.useRef(0);

    const minPanResponder = React.useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                startMin.current = budgetMin;
            },
            onPanResponderMove: (_, gestureState) => {
                if (sliderWidth <= 0) return;
                const delta = Math.round((gestureState.dx / sliderWidth) * 6);
                let next = startMin.current + delta;
                // Clamp and ensure min < max
                next = Math.max(0, Math.min(next, budgetMax - 1));
                setBudgetMin(next);
            }
        })
    ).current;

    const maxPanResponder = React.useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                startMax.current = budgetMax;
            },
            onPanResponderMove: (_, gestureState) => {
                if (sliderWidth <= 0) return;
                const delta = Math.round((gestureState.dx / sliderWidth) * 6);
                let next = startMax.current + delta;
                // Clamp and ensure max > min
                next = Math.max(budgetMin + 1, Math.min(next, 6));
                setBudgetMax(next);
            }
        })
    ).current;

    const toggleCategorySelection = (cat: string) => {
        setSelectedCat(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
    };

    const handleReset = () => {
        setSelectedCat([]);
        setBudgetMin(0);
        setBudgetMax(6);
        setSelectedRating("Any Rating");
        setSelectedLocation("Any Location");
    };

    return (
        <View style={[styles.filterRoot, { backgroundColor: colors.background }]}>
            {/* Design handle for modal interaction */}
            <View style={[styles.modalGrabHandle, { backgroundColor: colors.border }]} />

            {/* Header: Clean & Modern */}
            <View style={[styles.headerContainer, { borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.closeBtn, { backgroundColor: colors.muted + "40" }]}
                    onPress={() => navigation.goBack()}
                >
                    <Feather name="x" size={20} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground }]}>Filter Options</Text>
                <TouchableOpacity onPress={handleReset}>
                    <Text style={[styles.resetLabel, { color: colors.primary }]}>Reset All</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInsetOffset + 100 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Category Multi-Select */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Specializations</Text>
                    <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>Select one or more categories</Text>
                </View>
                <View style={styles.chipsRow}>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.chip, {
                                backgroundColor: selectedCat.includes(cat) ? colors.primary : colors.card,
                                borderColor: selectedCat.includes(cat) ? colors.primary : colors.border,
                            }]}
                            onPress={() => toggleCategorySelection(cat)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.chipText, { color: selectedCat.includes(cat) ? "#fff" : colors.foreground }]}>
                                {cat}
                            </Text>
                            {selectedCat.includes(cat) && <Ionicons name="checkmark-circle" size={14} color="#fff" style={{ marginLeft: 6 }} />}
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* Budget Range Visualizer */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Budget Range</Text>
                    <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>Average hourly rate (USD)</Text>
                </View>
                <View style={styles.budgetVisualizer}>
                    <View style={styles.budgetPreviewRow}>
                        <View style={[styles.budgetBox, { backgroundColor: colors.blueLight }]}>
                            <Text style={[styles.budgetCurrency, { color: colors.primary }]}>$</Text>
                            <Text style={[styles.budgetValue, { color: colors.primary }]}>{BUDGET_STEPS[budgetMin]}</Text>
                        </View>
                        <Ionicons name="arrow-forward" size={16} color={colors.mutedForeground} />
                        <View style={[styles.budgetBox, { backgroundColor: colors.blueLight }]}>
                            <Text style={[styles.budgetCurrency, { color: colors.primary }]}>$</Text>
                            <Text style={[styles.budgetValue, { color: colors.primary }]}>{BUDGET_STEPS[budgetMax]}{budgetMax === 6 ? "+" : ""}</Text>
                        </View>
                    </View>

                    {/* Draggable Slider Track */}
                    <View
                        style={styles.sliderTrackContainer}
                        onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
                    >
                        <View style={[styles.trackBase, { backgroundColor: colors.border }]} />
                        <View style={[styles.trackActive, {
                            backgroundColor: colors.primary,
                            left: `${(budgetMin / 6) * 100}%`,
                            right: `${100 - (budgetMax / 6) * 100}%`
                        }]} />

                        {/* Min Handle */}
                        <View
                            style={[styles.trackHandle, { left: `${(budgetMin / 6) * 100}%`, backgroundColor: colors.card, borderColor: colors.primary }]}
                            {...minPanResponder.panHandlers}
                        >
                            <View style={[styles.handleInner, { backgroundColor: colors.primary }]} />
                        </View>

                        {/* Max Handle */}
                        <View
                            style={[styles.trackHandle, { left: `${(budgetMax / 6) * 100}%`, backgroundColor: colors.card, borderColor: colors.primary }]}
                            {...maxPanResponder.panHandlers}
                        >
                            <View style={[styles.handleInner, { backgroundColor: colors.primary }]} />
                        </View>

                        {/* Step Indicators (Tappable) */}
                        {BUDGET_STEPS.map((_, i) => (
                            <TouchableOpacity
                                key={i}
                                style={[styles.trackStep, { left: `${(i / 6) * 100}%`, backgroundColor: i >= budgetMin && i <= budgetMax ? colors.primary : colors.border }]}
                                onPress={() => {
                                    const distMin = Math.abs(i - budgetMin);
                                    const distMax = Math.abs(i - budgetMax);
                                    if (distMin < distMax) setBudgetMin(i);
                                    else setBudgetMax(i);
                                }}
                            />
                        ))}
                    </View>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* Single Choice: Rating */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Reputation</Text>
                </View>
                {RATINGS.map(r => (
                    <TouchableOpacity
                        key={r}
                        style={[styles.listOptionRow, { borderBottomColor: colors.border + "40" }]}
                        onPress={() => setSelectedRating(r)}
                        activeOpacity={0.6}
                    >
                        <View style={styles.optionLeft}>
                            {r !== "Any Rating" && <Ionicons name="star" size={14} color="#FFB01F" style={{ marginRight: 8 }} />}
                            <Text style={[styles.optionLabel, { color: colors.foreground }]}>{r}</Text>
                        </View>
                        <View style={[styles.radioOutline, { borderColor: selectedRating === r ? colors.primary : colors.border }]}>
                            {selectedRating === r && <View style={[styles.radioFill, { backgroundColor: colors.primary }]} />}
                        </View>
                    </TouchableOpacity>
                ))}

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* Single Choice: Location */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Region</Text>
                </View>
                {LOCATIONS.map(loc => (
                    <TouchableOpacity
                        key={loc}
                        style={[styles.listOptionRow, { borderBottomColor: colors.border + "40" }]}
                        onPress={() => setSelectedLocation(loc)}
                        activeOpacity={0.6}
                    >
                        <Text style={[styles.optionLabel, { color: colors.foreground }]}>{loc}</Text>
                        <View style={[styles.radioOutline, { borderColor: selectedLocation === loc ? colors.primary : colors.border }]}>
                            {selectedLocation === loc && <View style={[styles.radioFill, { backgroundColor: colors.primary }]} />}
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Apply Button Footer */}
            <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: bottomInsetOffset }]}>
                <TouchableOpacity
                    style={[styles.applyBtn, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.85}
                >
                    <Text style={styles.applyBtnText}>Apply Active Filters</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    filterRoot: { flex: 1 },
    modalGrabHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginTop: 12 },
    headerContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 18, borderBottomWidth: 1 },
    closeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    resetLabel: { fontSize: 14, fontWeight: '600' },
    scrollContent: { padding: 20 },
    sectionHeader: { marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
    sectionSub: { fontSize: 12, fontWeight: '400' },
    chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    chip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, borderWidth: 1.5 },
    chipText: { fontSize: 13, fontWeight: '600' },
    divider: { height: 1.5, marginVertical: 24, opacity: 0.6 },
    budgetVisualizer: { gap: 20 },
    budgetPreviewRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16 },
    budgetBox: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
    budgetCurrency: { fontSize: 14, fontWeight: '600', marginRight: 2 },
    budgetValue: { fontSize: 18, fontWeight: '700' },
    sliderTrackContainer: { height: 30, justifyContent: "center", position: "relative", marginTop: 10 },
    trackBase: { width: '100%', height: 6, borderRadius: 3 },
    trackActive: { position: "absolute", height: 6, borderRadius: 3 },
    trackStep: { position: "absolute", width: 14, height: 14, borderRadius: 7, top: 8, marginLeft: -7, zIndex: 1 },
    trackHandle: {
        position: "absolute",
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        top: 1,
        marginLeft: -14,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
        ...Platform.select({
            ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
            android: { elevation: 4 },
        }),
    },
    handleInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    listOptionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 16, borderBottomWidth: 1 },
    optionLeft: { flexDirection: "row", alignItems: "center" },
    optionLabel: { fontSize: 15, fontWeight: '500' },
    radioOutline: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
    radioFill: { width: 12, height: 12, borderRadius: 6 },
    footer: { padding: 16, borderTopWidth: 1, position: "absolute", bottom: 0, left: 0, right: 0 },
    applyBtn: { height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
    applyBtnText: { color: "#fff", fontSize: 16, fontWeight: '700' },
});
