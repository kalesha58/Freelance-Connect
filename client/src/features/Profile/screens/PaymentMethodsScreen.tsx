import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";

import { useColors } from "@/hooks/useColors";
import { apiClient } from "@/utils/apiClient";

type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "rupay" | "other";

interface PaymentMethod {
    _id: string;
    type: "card" | "upi" | "bank";
    brand?: CardBrand;
    last4?: string;
    holderName?: string;
    expiryMonth?: number;
    expiryYear?: number;
    isDefault?: boolean;
    createdAt?: string;
}

const BRAND_LABEL: Record<CardBrand, string> = {
    visa: "Visa",
    mastercard: "Mastercard",
    amex: "American Express",
    discover: "Discover",
    rupay: "RuPay",
    other: "Card",
};

/** Identify card brand by IIN (BIN) prefix without storing the PAN. */
const detectBrand = (digits: string): CardBrand => {
    if (!digits) return "other";
    if (/^4/.test(digits)) return "visa";
    if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
    if (/^3[47]/.test(digits)) return "amex";
    if (/^6(011|5|4[4-9])/.test(digits)) return "discover";
    if (/^(6[05]|81|82|508)/.test(digits)) return "rupay";
    return "other";
};

const formatCardInput = (value: string) =>
    value.replace(/[^0-9]/g, "").slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ");

const luhnValid = (digits: string) => {
    if (!/^\d{12,19}$/.test(digits)) return false;
    let sum = 0;
    let dbl = false;
    for (let i = digits.length - 1; i >= 0; i -= 1) {
        let d = Number(digits[i]);
        if (dbl) {
            d *= 2;
            if (d > 9) d -= 9;
        }
        sum += d;
        dbl = !dbl;
    }
    return sum % 10 === 0;
};

const monthNow = new Date().getMonth() + 1;
const yearNow = new Date().getFullYear();

export default function PaymentMethodsScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();

    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    const [cardNumber, setCardNumber] = useState("");
    const [holderName, setHolderName] = useState("");
    const [expiry, setExpiry] = useState("");
    const [makeDefault, setMakeDefault] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const topInsetOffset = Platform.OS === "ios" ? insets.top : 20;

    const load = useCallback(async () => {
        try {
            const data = await apiClient("/payment-methods");
            setMethods(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error("Failed to load payment methods", err);
            Alert.alert("Could not load", err?.message || "Please try again.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            load();
        }, [load])
    );

    useEffect(() => {
        if (!showAddModal) {
            setCardNumber("");
            setHolderName("");
            setExpiry("");
            setMakeDefault(true);
        }
    }, [showAddModal]);

    const digitsOnly = cardNumber.replace(/\s/g, "");
    const detectedBrand = detectBrand(digitsOnly);
    const cardLooksValid = luhnValid(digitsOnly);

    const expiryParts = expiry.match(/^(\d{1,2})\s*\/\s*(\d{2,4})$/);
    const expiryMonth = expiryParts ? Number(expiryParts[1]) : NaN;
    const expiryYearRaw = expiryParts ? Number(expiryParts[2]) : NaN;
    const expiryYear = Number.isFinite(expiryYearRaw)
        ? expiryYearRaw < 100
            ? 2000 + expiryYearRaw
            : expiryYearRaw
        : NaN;

    const expiryValid =
        Number.isFinite(expiryMonth) &&
        Number.isFinite(expiryYear) &&
        expiryMonth >= 1 &&
        expiryMonth <= 12 &&
        expiryYear >= yearNow &&
        expiryYear <= yearNow + 30 &&
        !(expiryYear === yearNow && expiryMonth < monthNow);

    const canSubmit = cardLooksValid && expiryValid && holderName.trim().length >= 2 && !submitting;

    const handleAddCard = async () => {
        if (!canSubmit) return;
        try {
            setSubmitting(true);
            const last4 = digitsOnly.slice(-4);
            const created = await apiClient("/payment-methods", {
                method: "POST",
                body: {
                    type: "card",
                    brand: detectedBrand,
                    last4,
                    holderName: holderName.trim(),
                    expiryMonth,
                    expiryYear,
                    makeDefault,
                },
            });
            setMethods((prev) => {
                const next = makeDefault ? prev.map((m) => ({ ...m, isDefault: false })) : prev.slice();
                return [created, ...next];
            });
            setShowAddModal(false);
        } catch (err: any) {
            Alert.alert("Could not add card", err?.message || "Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            const updated = await apiClient(`/payment-methods/${id}/default`, { method: "PUT" });
            setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m._id === updated._id })));
        } catch (err: any) {
            Alert.alert("Could not update", err?.message || "Please try again.");
        }
    };

    const handleRemove = (id: string) => {
        Alert.alert(
            "Remove this method?",
            "You can add it back any time.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await apiClient(`/payment-methods/${id}`, { method: "DELETE" });
                            setMethods((prev) => {
                                const without = prev.filter((m) => m._id !== id);
                                if (!without.some((m) => m.isDefault) && without.length > 0) {
                                    without[0] = { ...without[0], isDefault: true };
                                }
                                return without;
                            });
                        } catch (err: any) {
                            Alert.alert("Could not remove", err?.message || "Please try again.");
                        }
                    },
                },
            ]
        );
    };

    const sortedMethods = useMemo(
        () => [...methods].sort((a, b) => Number(b.isDefault) - Number(a.isDefault)),
        [methods]
    );

    const renderItem = ({ item }: { item: PaymentMethod }) => {
        const brandLabel = BRAND_LABEL[(item.brand as CardBrand) || "other"];
        const expLabel =
            item.expiryMonth && item.expiryYear
                ? `${String(item.expiryMonth).padStart(2, "0")}/${String(item.expiryYear).slice(-2)}`
                : "";
        return (
            <View style={[styles.cardRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.brandBadge, { backgroundColor: colors.primary + "15" }]}>
                    <Feather name="credit-card" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                    <View style={styles.cardTitleRow}>
                        <Text style={[styles.brandLabel, { color: colors.foreground }]}>
                            {brandLabel} •••• {item.last4 || "----"}
                        </Text>
                        {item.isDefault ? (
                            <View style={[styles.defaultPill, { backgroundColor: colors.primary + "18" }]}>
                                <Text style={[styles.defaultPillText, { color: colors.primary }]}>Default</Text>
                            </View>
                        ) : null}
                    </View>
                    <Text style={[styles.cardSub, { color: colors.mutedForeground }]} numberOfLines={1}>
                        {item.holderName || "Cardholder"} {expLabel ? `• exp ${expLabel}` : ""}
                    </Text>
                    <View style={styles.cardActionRow}>
                        {!item.isDefault ? (
                            <TouchableOpacity
                                style={[styles.smallAction, { borderColor: colors.border }]}
                                onPress={() => handleSetDefault(item._id)}
                            >
                                <Text style={[styles.smallActionText, { color: colors.foreground }]}>Make default</Text>
                            </TouchableOpacity>
                        ) : null}
                        <TouchableOpacity
                            style={[styles.smallAction, { borderColor: colors.destructive + "60" }]}
                            onPress={() => handleRemove(item._id)}
                        >
                            <Text style={[styles.smallActionText, { color: colors.destructive }]}>Remove</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.root, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor={colors.headerBackground} />
            <View style={[styles.headerBar, { backgroundColor: colors.headerBackground, paddingTop: topInsetOffset + 6 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.headerIconBtn}>
                    <Feather name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment Methods</Text>
                <TouchableOpacity onPress={() => setShowAddModal(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.headerIconBtn}>
                    <Feather name="plus" size={22} color="#fff" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingBlock}>
                    <ActivityIndicator color={colors.primary} />
                </View>
            ) : sortedMethods.length === 0 ? (
                <View style={styles.emptyBlock}>
                    <View style={[styles.emptyIcon, { backgroundColor: colors.primary + "12" }]}>
                        <Feather name="credit-card" size={36} color={colors.primary} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No payment methods yet</Text>
                    <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
                        Add a card so you're ready to hire or pay platform fees the moment you need to.
                    </Text>
                    <TouchableOpacity
                        style={[styles.primaryBtn, { backgroundColor: colors.buttonPrimary }]}
                        onPress={() => setShowAddModal(true)}
                    >
                        <Feather name="plus" size={18} color={colors.onButtonPrimary} />
                        <Text style={[styles.primaryBtnText, { color: colors.onButtonPrimary }]}>Add a card</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={sortedMethods}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 12 }}
                    refreshing={refreshing}
                    onRefresh={() => {
                        setRefreshing(true);
                        load();
                    }}
                    ListFooterComponent={() => (
                        <View style={{ marginTop: 8 }}>
                            <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
                                Your full card number stays on this device. We only store the last 4 digits, brand, and
                                expiry for display.
                            </Text>
                        </View>
                    )}
                />
            )}

            <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
                <View style={styles.modalBackdrop}>
                    <View style={[styles.modalSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add a card</Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <Feather name="x" size={22} color={colors.mutedForeground} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Card number</Text>
                        <View style={[styles.inputWithIcon, { backgroundColor: colors.muted + "10", borderColor: colors.border }]}>
                            <TextInput
                                style={[styles.input, { color: colors.foreground }]}
                                placeholder="1234 5678 9012 3456"
                                placeholderTextColor={colors.mutedForeground}
                                keyboardType="number-pad"
                                value={cardNumber}
                                onChangeText={(v) => setCardNumber(formatCardInput(v))}
                                maxLength={23}
                            />
                            <Text style={[styles.brandHint, { color: colors.mutedForeground }]}>
                                {digitsOnly.length >= 2 ? BRAND_LABEL[detectedBrand] : ""}
                            </Text>
                        </View>
                        {digitsOnly.length >= 12 && !cardLooksValid ? (
                            <Text style={[styles.errorText, { color: colors.destructive }]}>That card number doesn't look right.</Text>
                        ) : null}

                        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Cardholder name</Text>
                        <TextInput
                            style={[styles.standaloneInput, { backgroundColor: colors.muted + "10", borderColor: colors.border, color: colors.foreground }]}
                            placeholder="Name on card"
                            placeholderTextColor={colors.mutedForeground}
                            value={holderName}
                            onChangeText={setHolderName}
                            autoCapitalize="words"
                            maxLength={80}
                        />

                        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Expiry (MM/YY)</Text>
                        <TextInput
                            style={[styles.standaloneInput, { backgroundColor: colors.muted + "10", borderColor: colors.border, color: colors.foreground }]}
                            placeholder="08/29"
                            placeholderTextColor={colors.mutedForeground}
                            value={expiry}
                            onChangeText={(v) => {
                                const cleaned = v.replace(/[^0-9/]/g, "").slice(0, 7);
                                if (cleaned.length === 2 && !cleaned.includes("/") && expiry.length === 1) {
                                    setExpiry(cleaned + "/");
                                } else {
                                    setExpiry(cleaned);
                                }
                            }}
                            keyboardType="number-pad"
                            maxLength={7}
                        />
                        {expiry.length > 0 && expiryParts && !expiryValid ? (
                            <Text style={[styles.errorText, { color: colors.destructive }]}>
                                Use MM/YY in the future (e.g. 08/29).
                            </Text>
                        ) : null}

                        <TouchableOpacity
                            style={styles.toggleRow}
                            onPress={() => setMakeDefault((v) => !v)}
                            activeOpacity={0.85}
                        >
                            <View
                                style={[
                                    styles.checkbox,
                                    {
                                        backgroundColor: makeDefault ? colors.primary : "transparent",
                                        borderColor: makeDefault ? colors.primary : colors.border,
                                    },
                                ]}
                            >
                                {makeDefault ? <Feather name="check" size={14} color="#fff" /> : null}
                            </View>
                            <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Use as default payment method</Text>
                        </TouchableOpacity>

                        <Text style={[styles.privacyNote, { color: colors.mutedForeground }]}>
                            We never send your full card number to our servers — only the last 4 digits, brand, and expiry are saved for display.
                        </Text>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.cancelBtn, { borderColor: colors.border }]}
                                onPress={() => setShowAddModal(false)}
                                disabled={submitting}
                            >
                                <Text style={[styles.cancelBtnText, { color: colors.foreground }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.saveBtn,
                                    { backgroundColor: canSubmit ? colors.buttonPrimary : colors.muted + "60" },
                                ]}
                                onPress={handleAddCard}
                                disabled={!canSubmit}
                            >
                                {submitting ? (
                                    <ActivityIndicator color={colors.onButtonPrimary} />
                                ) : (
                                    <Text style={[styles.saveBtnText, { color: canSubmit ? colors.onButtonPrimary : colors.mutedForeground }]}>
                                        Save card
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    headerBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 14,
    },
    headerIconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },

    loadingBlock: { flex: 1, alignItems: "center", justifyContent: "center" },

    emptyBlock: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
    emptyIcon: { width: 76, height: 76, borderRadius: 24, alignItems: "center", justifyContent: "center" },
    emptyTitle: { fontSize: 18, fontWeight: "700" },
    emptyDesc: { fontSize: 13, fontWeight: "400", textAlign: "center", lineHeight: 19, marginBottom: 6 },

    primaryBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 18,
        height: 46,
        borderRadius: 12,
    },
    primaryBtnText: { fontSize: 15, fontWeight: "700" },

    cardRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
    },
    brandBadge: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
    brandLabel: { fontSize: 15, fontWeight: "700" },
    defaultPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
    defaultPillText: { fontSize: 11, fontWeight: "700" },
    cardSub: { fontSize: 12, fontWeight: "400", marginTop: 2 },
    cardActionRow: { flexDirection: "row", gap: 8, marginTop: 10 },
    smallAction: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderRadius: 999 },
    smallActionText: { fontSize: 12, fontWeight: "600" },

    disclaimer: { fontSize: 11, lineHeight: 16, paddingHorizontal: 4 },

    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalSheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        borderTopWidth: 1,
        gap: 8,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    modalTitle: { fontSize: 18, fontWeight: "700" },
    fieldLabel: { fontSize: 12, fontWeight: "700", marginTop: 8, marginBottom: 4 },
    inputWithIcon: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
    },
    input: { flex: 1, fontSize: 15, paddingVertical: 12 },
    brandHint: { fontSize: 12, fontWeight: "600" },
    standaloneInput: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 15,
    },
    errorText: { fontSize: 12, marginTop: 4 },
    toggleRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14 },
    checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: "center", justifyContent: "center" },
    toggleLabel: { fontSize: 14, fontWeight: "600" },
    privacyNote: { fontSize: 11, lineHeight: 16, marginTop: 12 },
    modalActions: { flexDirection: "row", gap: 10, marginTop: 16 },
    cancelBtn: {
        flex: 1,
        height: 48,
        borderWidth: 1,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelBtnText: { fontSize: 15, fontWeight: "600" },
    saveBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    saveBtnText: { fontSize: 15, fontWeight: "700" },
});
