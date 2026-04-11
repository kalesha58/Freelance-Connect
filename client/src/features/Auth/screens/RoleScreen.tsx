import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { UserRole } from "@/types/auth";

/**
 * Screen used to differentiate between freelancer and requester personas.
 * Employs clean state management and centralized hooks.
 */
export default function RoleScreen({ navigation }: { navigation: any }) {
    const { t } = useTranslation();
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const { user, signIn } = useApp();
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

    /**
     * Finalizes the role selection and advances the user session.
     */
    const handleRoleFinalization = async () => {
        if (!selectedRole) {
            return;
        }
        if (user) {
            await signIn(user.email, selectedRole);
        }
        navigation.replace("Main");
    };

    /**
     * Definition of role UI configurations.
     */
    const ROLE_DEFINITIONS = [
        {
            id: "freelancer" as UserRole,
            title: "Freelancer / Tasker",
            desc: "Find jobs, showcase your portfolio, and earn money doing what you love.",
            iconName: "laptop",
            themeColor: colors.primary,
            perks: ["Find remote jobs", "Build portfolio", "Grow earnings"],
        },
        {
            id: "hiring" as UserRole,
            title: "Requester / Hiring Partner",
            desc: "Post jobs, hire top talent, and grow your business with skilled freelancers.",
            iconName: "briefcase",
            themeColor: colors.purpleAccent,
            perks: ["Post job listings", "Connect with talent", "Manage projects"],
        },
    ];

    return (
        <View style={[styles.mainLayout, { backgroundColor: colors.background }]}>
            <LinearGradient
                colors={[colors.navyDeep, colors.navyMid]}
                style={[styles.gradientHeader, { paddingTop: insets.top + 30 }]}
            >
                <View style={styles.brandRow}>
                    <View style={styles.brandIcon}>
                        <Text style={styles.brandT}>T</Text>
                    </View>
                    <Text style={styles.brandName}>Tasker</Text>
                </View>
                <Text style={styles.heroText}>Choose your role</Text>
                <Text style={styles.heroSub}>How do you want to use Tasker?</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + 20 }]} showsVerticalScrollIndicator={false}>
                {ROLE_DEFINITIONS.map((role) => (
                    <TouchableOpacity
                        key={role.id}
                        style={[
                            styles.selectionCard,
                            {
                                backgroundColor: colors.card,
                                borderColor: selectedRole === role.id ? role.themeColor : colors.border,
                            },
                            selectedRole === role.id && { shadowColor: role.themeColor, shadowOpacity: 0.25 },
                        ]}
                        onPress={() => setSelectedRole(role.id)}
                        activeOpacity={0.85}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: role.themeColor + "18" }]}>
                            <MaterialCommunityIcons name={role.iconName} size={32} color={role.themeColor} />
                        </View>
                        <View style={styles.infoCol}>
                            <Text style={[styles.roleLabel, { color: colors.foreground }]}>{role.title}</Text>
                            <Text style={[styles.roleSummary, { color: colors.mutedForeground }]}>{role.desc}</Text>
                            <View style={styles.perksList}>
                                {role.perks.map((perk) => (
                                    <View key={perk} style={styles.perkItem}>
                                        <Feather name="check-circle" size={14} color={colors.success} />
                                        <Text style={[styles.perkLabel, { color: colors.mutedForeground }]}>{perk}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                        {selectedRole === role.id && (
                            <View style={[styles.checkedIndicator, { backgroundColor: role.themeColor }]}>
                                <Feather name="check" size={14} color="#fff" />
                            </View>
                        )}
                    </TouchableOpacity>
                ))}

                <TouchableOpacity
                    style={[styles.confirmBtn, { backgroundColor: selectedRole ? colors.buttonPrimary : colors.muted }]}
                    onPress={handleRoleFinalization}
                    disabled={!selectedRole}
                    activeOpacity={0.85}
                >
                    <Text style={[styles.confirmLabel, { color: selectedRole ? colors.onButtonPrimary : colors.mutedForeground }]}>
                        Continue
                    </Text>
                    <Feather name="arrow-right" size={18} color={selectedRole ? colors.onButtonPrimary : colors.mutedForeground} />
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainLayout: {
        flex: 1,
    },
    gradientHeader: {
        paddingHorizontal: 24,
        paddingBottom: 32,
    },
    brandRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 24,
    },
    brandIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    brandT: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "700",
    },
    brandName: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "700",
    },
    heroText: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 6,
    },
    heroSub: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 14,
        fontWeight: "400",
    },
    formContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        gap: 14,
    },
    selectionCard: {
        borderRadius: 20,
        padding: 18,
        borderWidth: 2,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 4,
        position: "relative",
        flexDirection: 'row',
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    infoCol: {
        flex: 1,
    },
    roleLabel: {
        fontSize: 17,
        fontWeight: "700",
        marginBottom: 6,
    },
    roleSummary: {
        fontSize: 13,
        fontWeight: "400",
        lineHeight: 19,
        marginBottom: 12,
    },
    perksList: {
        gap: 6,
    },
    perkItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    perkLabel: {
        fontSize: 12,
        fontWeight: "500",
    },
    checkedIndicator: {
        position: "absolute",
        top: 16,
        right: 16,
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    confirmBtn: {
        borderRadius: 16,
        paddingVertical: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 6,
    },
    confirmLabel: {
        fontSize: 16,
        fontWeight: "700",
    },
});
