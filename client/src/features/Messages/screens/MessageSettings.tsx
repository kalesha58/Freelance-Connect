import React from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Switch,
    StatusBar,
    Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useColors } from "@/hooks/useColors";

export default function MessageSettings() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();

    const [isReadReceipts, setReadReceipts] = React.useState(true);
    const [isTypingIndicators, setTypingIndicators] = React.useState(true);
    const [isNotifications, setNotifications] = React.useState(true);

    const topInsetOffset = Platform.OS === "ios" ? insets.top : 20;

    const SettingRow = ({ icon, label, value, onToggle }: any) => (
        <View style={[styles.settingRow, { borderBottomColor: colors.border + "40" }]}>
            <View style={styles.settingLeft}>
                <View style={[styles.iconWrapper, { backgroundColor: colors.blueLight }]}>
                    <Feather name={icon} size={18} color={colors.primary} />
                </View>
                <Text style={[styles.settingLabel, { color: colors.foreground }]}>{label}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={"#fff"}
            />
        </View>
    );

    return (
        <View style={[styles.root, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="dark-content" />

            <View style={[styles.header, { paddingTop: topInsetOffset + 10, borderBottomColor: colors.border }]}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Feather name="arrow-left" size={24} color={colors.foreground} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.foreground }]}>Message Settings</Text>
                    <View style={{ width: 40 }} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.section}>
                    <Text style={[styles.sectionHeader, { color: colors.primary }]}>Privacy & Activity</Text>
                    <SettingRow
                        icon="check-circle"
                        label="Read Receipts"
                        value={isReadReceipts}
                        onToggle={setReadReceipts}
                    />
                    <SettingRow
                        icon="edit-3"
                        label="Typing Indicators"
                        value={isTypingIndicators}
                        onToggle={setTypingIndicators}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionHeader, { color: colors.primary }]}>Alerts</Text>
                    <SettingRow
                        icon="bell"
                        label="New Message Notifications"
                        value={isNotifications}
                        onToggle={setNotifications}
                    />
                </View>

                <TouchableOpacity style={[styles.dangerSection, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
                    <Ionicons name="trash-outline" size={20} color={colors.destructive} />
                    <Text style={[styles.dangerText, { color: colors.destructive }]}>Clear all conversations</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    header: { paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1 },
    headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    headerTitle: { fontSize: 18, fontWeight: "700" },
    scrollContent: { paddingTop: 10 },
    section: { marginBottom: 24, paddingHorizontal: 16 },
    sectionHeader: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 },
    settingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1 },
    settingLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    iconWrapper: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    settingLabel: { fontSize: 16, fontWeight: "500" },
    dangerSection: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, marginTop: 10, borderTopWidth: 1, borderBottomWidth: 1 },
    dangerText: { fontSize: 16, fontWeight: "600" },
});
