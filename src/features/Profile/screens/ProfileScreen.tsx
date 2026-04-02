import React from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    StatusBar,
    Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get('window');

const MOCK_PORTFOLIO = [
    {
        id: "p1",
        image: "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1000&auto=format&fit=crop",
        label: "Fintech App UI",
        category: "Mobile Design"
    },
    {
        id: "p2",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop",
        label: "Code Architecture",
        category: "Development"
    },
    {
        id: "p3",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop",
        label: "Data Dashboard",
        category: "Analytics"
    },
    {
        id: "p4",
        image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1000&auto=format&fit=crop",
        label: "Brand Identity",
        category: "Branding"
    },
];

/**
 * ProfileScreen manages the user's professional profile, skills, and portfolio.
 * Reverted to the stable high-fidelity identity layout.
 */
export default function ProfileScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const { user, signOut } = useApp();
    const navigation = useNavigation<any>();

    const topInsetOffset = Platform.OS === "ios" ? insets.top : 20;

    if (!user) {
        return (
            <View style={[styles.emptyView, { backgroundColor: colors.background }]}>
                <Ionicons name="person-circle-outline" size={80} color={colors.mutedForeground} />
                <Text style={[styles.loginPrompt, { color: colors.foreground }]}>Sign in to view your profile</Text>
                <TouchableOpacity
                    style={[styles.loginBtn, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate("Login")}
                >
                    <Text style={styles.loginBtnLabel}>Sign In</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const roleAccentColor = user.role === "freelancer" ? colors.primary : colors.purpleAccent;
    const roleName = user.role === "freelancer" ? "Freelancer" : "Hiring Partner";

    return (
        <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

            {/* Premium Solid Brand Header with User Identity */}
            <View style={[styles.headerSolid, { backgroundColor: colors.primary, paddingTop: topInsetOffset + 12, paddingBottom: 60 }]}>
                <View style={styles.headerContent}>
                    <View style={styles.headerTitleGroup}>
                        <Text style={[styles.screenSubtitle, { color: 'rgba(255,255,255,0.7)' }]}>Professional Profile</Text>
                        <Text style={[styles.screenHeading, { color: '#fff' }]} numberOfLines={1}>{user.name}</Text>
                    </View>
                    <View style={styles.headerActionGroup}>
                        <TouchableOpacity
                            style={[styles.headerActionBtn, { backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.2)' }]}
                            onPress={() => console.log("Share Profile")}
                        >
                            <Feather name="share-2" size={19} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.headerActionBtn, { backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.2)' }]}
                            onPress={() => navigation.navigate("Settings")}
                        >
                            <Feather name="settings" size={20} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.headerActionBtn, { backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.2)' }]}
                            onPress={signOut}
                        >
                            <Feather name="log-out" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ScrollView
                style={styles.mainView}
                contentContainerStyle={[styles.scrollContentLayout, { marginTop: -50 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Identity Card */}
                <View style={[styles.identityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.avatarWrapper}>
                        <View style={[styles.avatarBorder, { borderColor: roleAccentColor }]}>
                            {user.avatar ? (
                                <Image source={{ uri: user.avatar }} style={styles.mainAvatarImg} />
                            ) : (
                                <View style={[styles.avatarFallback, { backgroundColor: roleAccentColor }]}>
                                    <Text style={styles.avatarInitialText}>{user.name.charAt(0)}</Text>
                                </View>
                            )}
                        </View>
                        <TouchableOpacity style={[styles.editAvatarBadge, { backgroundColor: colors.primary }]}>
                            <Feather name="camera" size={12} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.profileName, { color: colors.foreground }]}>{user.name}</Text>
                    <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>{user.email}</Text>

                    <View style={[styles.roleLabelBadge, { backgroundColor: roleAccentColor + "15" }]}>
                        <View style={[styles.roleDot, { backgroundColor: roleAccentColor }]} />
                        <Text style={[styles.roleText, { color: roleAccentColor }]}>{roleName}</Text>
                    </View>

                    <Text style={[styles.bioText, { color: colors.mutedForeground }]}>
                        {user.bio || "Crafting digital experiences with passion. Senior UI/UX Designer & Frontend Developer specialized in mobile applications."}
                    </Text>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsContainer}>
                    {[
                        { label: "Followers", value: "2.4K", icon: "people", color: "#3b82f6" },
                        { label: "Completed", value: "18", icon: "checkmark-done-circle", color: "#10b981" },
                        { label: "Earnings", value: "$4.2K", icon: "wallet", color: "#8b5cf6" },
                    ].map((stat, idx) => (
                        <View key={stat.label} style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={[styles.statIconCircle, { backgroundColor: stat.color + "15" }]}>
                                <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                            </View>
                            <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
                            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Portfolio Section */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Professional Portfolio</Text>
                    <TouchableOpacity style={styles.viewMoreBtn}>
                        <Text style={[styles.viewMoreText, { color: colors.primary }]}>View All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.portfolioGrid}>
                    {MOCK_PORTFOLIO.map(item => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.portfolioItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                            activeOpacity={0.9}
                        >
                            <Image source={{ uri: item.image }} style={styles.portfolioImage} />
                            <View style={styles.portfolioOverlay}>
                                <View style={styles.itemCategoryBadge}>
                                    <Text style={styles.itemCategoryText}>{item.category}</Text>
                                </View>
                                <Text style={styles.itemLabelText}>{item.label}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Account Links */}
                <View style={[styles.accountLinksCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    {[
                        { label: "Payment Methods", icon: "credit-card", color: "#0ea5e9" },
                        { label: "My Reviews", icon: "star", color: "#f59e0b" },
                        { label: "Help & Support", icon: "life-buoy", color: "#6366f1" },
                    ].map((link, idx) => (
                        <TouchableOpacity
                            key={link.label}
                            style={[
                                styles.accountLinkItem,
                                idx !== 2 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                            ]}
                        >
                            <View style={styles.linkLeftGroup}>
                                <View style={[styles.linkIconBox, { backgroundColor: link.color + "15" }]}>
                                    <Feather name={link.icon as any} size={18} color={link.color} />
                                </View>
                                <Text style={[styles.linkText, { color: colors.foreground }]}>{link.label}</Text>
                            </View>
                            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1 },
    mainView: { flex: 1 },
    scrollContentLayout: { paddingHorizontal: 16, paddingBottom: 120, paddingTop: 16 },
    headerSolid: {
        width: '100%',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 10
    },
    headerTitleGroup: { flex: 1, paddingRight: 10 },
    screenHeading: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
    screenSubtitle: { fontSize: 13, fontWeight: '500', marginBottom: 2 },
    headerActionGroup: { flexDirection: "row", gap: 10, alignItems: 'center' },
    headerActionBtn: {
        width: 42,
        height: 42,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
    },
    emptyView: { flex: 1, alignItems: "center", justifyContent: "center", gap: 20 },
    loginPrompt: { fontSize: 18, fontWeight: '600' },
    loginBtn: { paddingHorizontal: 36, paddingVertical: 14, borderRadius: 16 },
    loginBtnLabel: { color: "#fff", fontSize: 16, fontWeight: '700' },
    identityCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        alignItems: "center",
        marginBottom: 20,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.04,
        shadowRadius: 15,
        elevation: 3,
    },
    avatarWrapper: { position: "relative", marginBottom: 16 },
    avatarBorder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        padding: 4,
        alignItems: "center",
        justifyContent: "center",
    },
    mainAvatarImg: { width: 86, height: 86, borderRadius: 43 },
    avatarFallback: { width: 86, height: 86, borderRadius: 43, alignItems: "center", justifyContent: "center" },
    avatarInitialText: { color: "#fff", fontSize: 36, fontWeight: '700' },
    editAvatarBadge: {
        position: "absolute",
        bottom: 2,
        right: 2,
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#fff",
    },
    profileName: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
    profileEmail: { fontSize: 14, fontWeight: '400', marginBottom: 12 },
    roleLabelBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 16,
        gap: 6,
    },
    roleDot: { width: 6, height: 6, borderRadius: 3 },
    roleText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: "uppercase" },
    bioText: { fontSize: 14, fontWeight: '400', textAlign: "center", lineHeight: 21, paddingHorizontal: 10 },
    statsContainer: { flexDirection: "row", gap: 12, marginBottom: 24 },
    statBox: { flex: 1, borderRadius: 20, padding: 16, borderWidth: 1, alignItems: "center" },
    statIconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 8 },
    statValue: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
    statLabel: { fontSize: 12, fontWeight: '500' },
    sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700' },
    viewMoreBtn: { padding: 4 },
    viewMoreText: { fontSize: 14, fontWeight: '600' },
    portfolioGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
    portfolioItem: {
        width: (width - 44) / 2,
        aspectRatio: 1,
        borderRadius: 20,
        overflow: "hidden",
        borderWidth: 1,
    },
    portfolioImage: { width: '100%', height: '100%' },
    portfolioOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
        backgroundColor: "rgba(0,0,0,0.4)"
    },
    itemCategoryBadge: {
        backgroundColor: "rgba(255,255,255,0.2)",
        alignSelf: "flex-start",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        marginBottom: 4,
    },
    itemCategoryText: { color: "#fff", fontSize: 9, fontWeight: '700', textTransform: "uppercase" },
    itemLabelText: { color: "#fff", fontSize: 13, fontWeight: '600' },
    accountLinksCard: { borderRadius: 24, padding: 8, borderWidth: 1 },
    accountLinkItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
    linkLeftGroup: { flexDirection: "row", alignItems: "center", gap: 12 },
    linkIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    linkText: { fontSize: 15, fontWeight: '600' },
});
