import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { apiClient } from "@/utils/apiClient";

const PASSWORD_POLICY_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

const formatDate = (iso?: string) => {
    if (!iso) return "—";
    try {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return "—";
        return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    } catch {
        return "—";
    }
};

export default function SecurityScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { user, signOut } = useApp();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const topInsetOffset = Platform.OS === "ios" ? insets.top : 20;

    const policyOk = PASSWORD_POLICY_REGEX.test(newPassword);
    const matchOk = newPassword.length > 0 && newPassword === confirmPassword;
    const distinctOk = newPassword !== currentPassword;

    const canSubmit = useMemo(
        () =>
            currentPassword.length > 0 &&
            policyOk &&
            matchOk &&
            distinctOk &&
            !submitting,
        [currentPassword, policyOk, matchOk, distinctOk, submitting]
    );

    const handleChangePassword = async () => {
        if (!canSubmit) return;
        try {
            setSubmitting(true);
            await apiClient("/auth/change-password", {
                method: "POST",
                body: { currentPassword, newPassword },
            });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            Alert.alert("Password updated", "Your account password has been changed.");
        } catch (err: any) {
            const msg = err?.message || "Could not change password.";
            Alert.alert("Couldn't update password", msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSignOutEverywhere = () => {
        Alert.alert(
            "Sign out of this device?",
            "This signs you out of the app on this device. You'll need to sign in again the next time you open it.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Sign out",
                    style: "destructive",
                    onPress: () => signOut().catch(() => {}),
                },
            ]
        );
    };

    const PolicyHint = ({ ok, children }: { ok: boolean; children: React.ReactNode }) => (
        <View style={styles.hintRow}>
            <Feather
                name={ok ? "check" : "circle"}
                size={14}
                color={ok ? colors.success ?? colors.primary : colors.mutedForeground}
            />
            <Text style={[styles.hintText, { color: ok ? colors.foreground : colors.mutedForeground }]}>{children}</Text>
        </View>
    );

    return (
        <View style={[styles.root, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor={colors.headerBackground} />
            <View style={[styles.headerBar, { backgroundColor: colors.headerBackground, paddingTop: topInsetOffset + 6 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.headerIconBtn}>
                    <Feather name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Security</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.foreground }]}>Account</Text>
                    <View style={styles.row}>
                        <Feather name="mail" size={16} color={colors.mutedForeground} />
                        <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>Email</Text>
                        <Text style={[styles.rowValue, { color: colors.foreground }]} numberOfLines={1}>
                            {user?.email || "—"}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Feather name="shield" size={16} color={colors.mutedForeground} />
                        <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>Verification</Text>
                        <View style={[styles.statusPill, { backgroundColor: ((user as any)?.isVerified ? colors.success ?? colors.primary : colors.mutedForeground) + "18" }]}>
                            <Text style={[styles.statusPillText, { color: (user as any)?.isVerified ? colors.success ?? colors.primary : colors.mutedForeground }]}>
                                {(user as any)?.isVerified ? "Verified" : "Not verified"}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <Feather name="calendar" size={16} color={colors.mutedForeground} />
                        <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>Member since</Text>
                        <Text style={[styles.rowValue, { color: colors.foreground }]}>{formatDate((user as any)?.createdAt)}</Text>
                    </View>
                </View>

                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.foreground }]}>Change password</Text>
                    <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
                        Use a strong password you don't reuse anywhere else.
                    </Text>

                    <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Current password</Text>
                    <View style={[styles.inputWithIcon, { backgroundColor: colors.muted + "10", borderColor: colors.border }]}>
                        <TextInput
                            style={[styles.input, { color: colors.foreground }]}
                            placeholder="Enter current password"
                            placeholderTextColor={colors.mutedForeground}
                            secureTextEntry={!showCurrent}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <TouchableOpacity onPress={() => setShowCurrent((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Feather name={showCurrent ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.fieldLabel, { color: colors.foreground }]}>New password</Text>
                    <View style={[styles.inputWithIcon, { backgroundColor: colors.muted + "10", borderColor: colors.border }]}>
                        <TextInput
                            style={[styles.input, { color: colors.foreground }]}
                            placeholder="At least 6 chars, 1 uppercase, 1 number, 1 symbol"
                            placeholderTextColor={colors.mutedForeground}
                            secureTextEntry={!showNew}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <TouchableOpacity onPress={() => setShowNew((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Feather name={showNew ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Confirm new password</Text>
                    <TextInput
                        style={[styles.standaloneInput, { backgroundColor: colors.muted + "10", borderColor: colors.border, color: colors.foreground }]}
                        placeholder="Re-enter new password"
                        placeholderTextColor={colors.mutedForeground}
                        secureTextEntry={!showNew}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <View style={{ marginTop: 12, gap: 6 }}>
                        <PolicyHint ok={newPassword.length >= 6}>At least 6 characters</PolicyHint>
                        <PolicyHint ok={/[A-Z]/.test(newPassword)}>An uppercase letter</PolicyHint>
                        <PolicyHint ok={/\d/.test(newPassword)}>A number</PolicyHint>
                        <PolicyHint ok={/[@$!%*?&]/.test(newPassword)}>A special character (@ $ ! % * ? &)</PolicyHint>
                        <PolicyHint ok={matchOk}>New password matches confirmation</PolicyHint>
                        <PolicyHint ok={newPassword.length > 0 && distinctOk}>Different from your current password</PolicyHint>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.primaryBtn,
                            {
                                backgroundColor: canSubmit ? colors.buttonPrimary : colors.muted + "60",
                                marginTop: 16,
                            },
                        ]}
                        onPress={handleChangePassword}
                        disabled={!canSubmit}
                    >
                        {submitting ? (
                            <ActivityIndicator color={colors.onButtonPrimary} />
                        ) : (
                            <Text style={[styles.primaryBtnText, { color: canSubmit ? colors.onButtonPrimary : colors.mutedForeground }]}>
                                Update password
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.foreground }]}>This device</Text>
                    <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
                        Sign out if you're using a shared phone or just want to lock the app.
                    </Text>
                    <TouchableOpacity
                        style={[styles.outlineBtn, { borderColor: colors.destructive }]}
                        onPress={handleSignOutEverywhere}
                    >
                        <Feather name="log-out" size={18} color={colors.destructive} />
                        <Text style={[styles.outlineBtnText, { color: colors.destructive }]}>Sign out of this device</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
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

    card: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        marginBottom: 16,
    },
    cardTitle: { fontSize: 16, fontWeight: "700" },
    cardSub: { fontSize: 12, fontWeight: "400", marginTop: 4, lineHeight: 18 },

    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 12,
    },
    rowLabel: { fontSize: 12, fontWeight: "600", width: 100 },
    rowValue: { flex: 1, fontSize: 13, fontWeight: "600", textAlign: "right" },
    statusPill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
    statusPillText: { fontSize: 11, fontWeight: "700" },

    fieldLabel: { fontSize: 12, fontWeight: "700", marginTop: 12, marginBottom: 4 },
    inputWithIcon: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
    },
    input: { flex: 1, fontSize: 15, paddingVertical: 12 },
    standaloneInput: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 15,
    },

    hintRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    hintText: { fontSize: 12, fontWeight: "500" },

    primaryBtn: {
        height: 48,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    primaryBtnText: { fontSize: 15, fontWeight: "700" },

    outlineBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: 46,
        borderRadius: 12,
        borderWidth: 1.5,
        marginTop: 14,
    },
    outlineBtnText: { fontSize: 14, fontWeight: "700" },
});
