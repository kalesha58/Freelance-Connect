import React, { useState } from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
    StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";

import { useApp } from "@/context/AppContext";
import { ThemeMode, useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";

/**
 * SettingsScreen provides account configuration and application preferences.
 * High-fidelity settings categories using native React components.
 */
export default function SettingsScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { user, signOut } = useApp();
    const { themeMode, setThemeMode, isDark } = useTheme();

    const [notifJobs, setNotifJobs] = useState(true);
    const [notifMessages, setNotifMessages] = useState(true);
    const [notifActivity, setNotifActivity] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const topInsetOffset = Platform.OS === "ios" ? insets.top : 20;

    const THEME_OPTIONS: { label: string; value: ThemeMode; icon: string; desc: string }[] = [
        { label: "Light", value: "light", icon: "sun", desc: "Always light" },
        { label: "Dark", value: "dark", icon: "moon", desc: "Always dark" },
        { label: "System", value: "system", icon: "smartphone", desc: "Follow device" },
    ];

    return (
        <View style={[styles.settingsRoot, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
            <View style={[styles.settingsHeaderBar, { backgroundColor: colors.primary, paddingTop: topInsetOffset + 6 }]}>
                <TouchableOpacity
                    style={[styles.circularNavBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
                    onPress={() => navigation.goBack()}
                >
                    <Feather name="arrow-left" size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={[styles.headerHeadingTitle, { color: '#fff' }]}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={[styles.settingsScrollPadding, { paddingBottom: 60 }]} showsVerticalScrollIndicator={false}>
                {user && (
                    <TouchableOpacity
                        style={[styles.profileBriefCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.bigAvatarCircle, { backgroundColor: colors.primary }]}>
                            <Text style={styles.bigAvatarLabel}>{user.name.charAt(0)}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.briefProfileName, { color: colors.foreground }]}>{user.name}</Text>
                            <Text style={[styles.briefProfileEmail, { color: colors.mutedForeground }]}>{user.email}</Text>
                        </View>
                        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                    </TouchableOpacity>
                )}

                <SettingSection title="APPEARANCE" colors={colors}>
                    <View style={[styles.singleSettingRow, styles.rowWithBorder, { borderBottomColor: colors.border }]}>
                        <View style={[styles.rowIconSurface, { backgroundColor: isDark ? colors.navyMid : colors.blueLight }]}>
                            <Feather name={isDark ? "moon" : "sun"} size={18} color={colors.primary} />
                        </View>
                        <View style={styles.rowMainContent}>
                            <Text style={[styles.rowPrimaryLabel, { color: colors.foreground }]}>{isDark ? "Dark Mode" : "Light Mode"}</Text>
                            <Text style={[styles.rowSecondarySub, { color: colors.mutedForeground }]}>{themeMode === "system" ? "Follows system" : `Manual: ${themeMode}`}</Text>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={val => setThemeMode(val ? "dark" : "light")}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor="#fff"
                        />
                    </View>
                    <View style={styles.themePickerTogglesRow}>
                        {THEME_OPTIONS.map(opt => {
                            const isActive = themeMode === opt.value;
                            return (
                                <TouchableOpacity
                                    key={opt.value}
                                    style={[styles.individualThemeBox, { backgroundColor: isActive ? colors.primary : colors.muted, borderColor: isActive ? colors.primary : colors.border }]}
                                    onPress={() => setThemeMode(opt.value)}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.themeBoxIconSurface, isActive ? styles.themeActiveIconBg : { backgroundColor: colors.background }]}>
                                        <Feather name={opt.icon as any} size={16} color={isActive ? "#fff" : colors.mutedForeground} />
                                    </View>
                                    <Text style={[styles.themeBoxPrimaryLabel, { color: isActive ? "#fff" : colors.foreground }]}>{opt.label}</Text>
                                    {isActive && <View style={styles.activeCheckmarkMarker}><Feather name="check" size={10} color="#fff" /></View>}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </SettingSection>

                <SettingSection title="ACCOUNT" colors={colors}>
                    <SettingRow icon="user" label="Edit Profile" onPress={() => { }} colors={colors} />
                    <SettingRow icon="credit-card" label="Payments" sublabel="Manage cards & billing" onPress={() => { }} colors={colors} />
                    <SettingRow icon="star" label="Reviews" onPress={() => navigation.navigate("Ratings")} colors={colors} />
                    <SettingRow icon="shield" label="Security" sublabel="Password & Verification" onPress={() => { }} isLast colors={colors} />
                </SettingSection>

                <SettingSection title="NOTIFICATIONS" colors={colors}>
                    <SettingRow icon="briefcase" label="Job Alerts" rightElement={<Switch value={notifJobs} onValueChange={setNotifJobs} trackColor={{ true: colors.primary }} thumbColor="#fff" />} colors={colors} />
                    <SettingRow icon="message-circle" label="Messages" rightElement={<Switch value={notifMessages} onValueChange={setNotifMessages} trackColor={{ true: colors.primary }} thumbColor="#fff" />} colors={colors} />
                    <SettingRow icon="activity" label="Activity" rightElement={<Switch value={notifActivity} onValueChange={setNotifActivity} trackColor={{ true: colors.primary }} thumbColor="#fff" />} isLast colors={colors} />
                </SettingSection>

                <SettingSection title="LEGAL & SUPPORT" colors={colors}>
                    <SettingRow icon="help-circle" label="Help Center" onPress={() => navigation.navigate("Help")} colors={colors} />
                    <SettingRow icon="flag" label="Report an Issue" onPress={() => navigation.navigate("Report")} colors={colors} />
                    <SettingRow icon="file-text" label="Terms of Service" onPress={() => navigation.navigate("Terms")} isLast colors={colors} />
                </SettingSection>

                <SettingSection title="ACTIONS" colors={colors}>
                    <SettingRow icon="log-out" label="Sign Out" isDanger onPress={() => setShowLogoutModal(true)} isLast colors={colors} />
                </SettingSection>
            </ScrollView>

            {showLogoutModal && (
                <View style={styles.modalBackdropOverlay}>
                    <View style={[styles.confirmationDialogBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[styles.dangerIconSurface, { backgroundColor: colors.destructive + "18" }]}>
                            <Feather name="log-out" size={28} color={colors.destructive} />
                        </View>
                        <Text style={[styles.dialogTitleHeading, { color: colors.foreground }]}>Sign Out?</Text>
                        <Text style={[styles.dialogContextCopy, { color: colors.mutedForeground }]}>Are you sure you want to sign out of your account?</Text>
                        <View style={styles.dialogActionsRow}>
                            <TouchableOpacity
                                style={[styles.dismissActionBtn, { borderColor: colors.border }]}
                                onPress={() => setShowLogoutModal(false)}
                            >
                                <Text style={[styles.dismissActionLabel, { color: colors.foreground }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.primaryLogoutActionBtn, { backgroundColor: colors.destructive }]}
                                onPress={async () => {
                                    setShowLogoutModal(false);
                                    await signOut();
                                    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
                                }}
                            >
                                <Text style={styles.primaryLogoutActionLabel}>Sign Out</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}

const SettingSection = ({ title, children, colors }: { title: string; children: React.ReactNode; colors: any }) => (
    <View style={styles.settingsSectionWrapper}>
        <Text style={[styles.sectionHeadingLabel, { color: colors.mutedForeground }]}>{title}</Text>
        <View style={[styles.sectionContentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {children}
        </View>
    </View>
);

const SettingRow = ({
    icon, label, sublabel, onPress, rightElement, isDanger, isLast, colors,
}: { icon: string; label: string; sublabel?: string; onPress?: () => void; rightElement?: React.ReactNode; isDanger?: boolean; isLast?: boolean; colors: any }) => (
    <TouchableOpacity
        style={[styles.singleSettingRow, !isLast && styles.rowWithBorder, !isLast && { borderBottomColor: colors.border }]}
        onPress={onPress}
        disabled={!onPress && !rightElement}
        activeOpacity={0.7}
    >
        <View style={[styles.rowIconSurface, { backgroundColor: isDanger ? colors.destructive + "15" : colors.muted }]}>
            <Feather name={icon as any} size={18} color={isDanger ? colors.destructive : colors.foreground} />
        </View>
        <View style={styles.rowMainContent}>
            <Text style={[styles.rowPrimaryLabel, { color: isDanger ? colors.destructive : colors.foreground }]}>{label}</Text>
            {sublabel && <Text style={[styles.rowSecondarySub, { color: colors.mutedForeground }]}>{sublabel}</Text>}
        </View>
        {rightElement ?? (onPress && <Feather name="chevron-right" size={18} color={colors.mutedForeground} />)}
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    settingsRoot: { flex: 1 },
    settingsHeaderBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
    circularNavBtn: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
    headerHeadingTitle: { fontSize: 18, fontWeight: '700' },
    settingsScrollPadding: { padding: 16 },
    profileBriefCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
    bigAvatarCircle: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
    bigAvatarLabel: { color: "#fff", fontSize: 20, fontWeight: '700' },
    briefProfileName: { fontSize: 15, fontWeight: '700' },
    briefProfileEmail: { fontSize: 12, fontWeight: '400' },
    settingsSectionWrapper: { marginBottom: 20 },
    sectionHeadingLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8, paddingLeft: 4 },
    sectionContentCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
    singleSettingRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
    rowIconSurface: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    rowPrimaryLabel: { fontSize: 14, fontWeight: '600' },
    rowSecondarySub: { fontSize: 11, fontWeight: '400', marginTop: 1 },
    themePickerTogglesRow: { flexDirection: "row", gap: 8, padding: 12 },
    individualThemeBox: { flex: 1, borderRadius: 14, padding: 12, borderWidth: 1.5, alignItems: "center", gap: 6, position: "relative" },
    themeBoxIconSurface: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    themeBoxPrimaryLabel: { fontSize: 12, fontWeight: '700' },
    activeCheckmarkMarker: { position: "absolute", top: 6, right: 6, width: 16, height: 16, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.3)", alignItems: "center", justifyContent: "center" },
    modalBackdropOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", zIndex: 100 },
    confirmationDialogBox: { width: "85%", borderRadius: 24, padding: 24, borderWidth: 1, alignItems: "center", gap: 12 },
    dangerIconSurface: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center" },
    dialogTitleHeading: { fontSize: 20, fontWeight: '700' },
    dialogContextCopy: { fontSize: 13, fontWeight: '400', textAlign: "center", lineHeight: 19 },
    dialogActionsRow: { flexDirection: "row", gap: 10, marginTop: 4, width: "100%" },
    dismissActionBtn: { flex: 1, borderWidth: 1.5, borderRadius: 14, paddingVertical: 13, alignItems: "center" },
    dismissActionLabel: { fontSize: 15, fontWeight: '600' },
    primaryLogoutActionBtn: { flex: 1, borderRadius: 14, paddingVertical: 13, alignItems: "center" },
    primaryLogoutActionLabel: { color: "#fff", fontSize: 15, fontWeight: '700' },
    rowWithBorder: { borderBottomWidth: 1 },
    rowMainContent: { flex: 1 },
    themeActiveIconBg: { backgroundColor: "rgba(255,255,255,0.2)" },
});
