import React, { useEffect, useState } from "react";
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
    Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
const MCI = MaterialCommunityIcons;

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { PostCard } from "@/components/PostCard/PostCard";

const { width } = Dimensions.get('window');


/**
 * ProfileScreen manages the user's professional profile, skills, and portfolio.
 * Reverted to the stable high-fidelity identity layout.
 */
type ProfileRouteProp = RouteProp<{ Profile: { id?: string } }, 'Profile'>;

export default function ProfileScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const route = useRoute<ProfileRouteProp>();
    const { id: targetUserId } = route.params || {};

    const { user: currentUser, signOut, posts: allPosts } = useApp();
    const [targetUser, setTargetUser] = useState<any>(null);
    const [loading, setLoading] = useState(!!targetUserId);

    // If viewing own profile, use currentUser, else use targetUser
    const user = targetUserId ? targetUser : currentUser;
    const isOwnProfile = !targetUserId || targetUserId === currentUser?._id;

    useEffect(() => {
        if (targetUserId && targetUserId !== currentUser?._id) {
            loadTargetUser();
        }
    }, [targetUserId]);

    const loadTargetUser = async () => {
        setLoading(true);
        try {
            // We'll use a fetch call here. In a real app, this should be in AppContext.
            // For now, we'll implement it locally or add to AppContext.
            const response = await fetch(`https://freelance-connect.vercel.app/api/users/${targetUserId}`);
            const data = await response.json();
            setTargetUser(data);
        } catch (error) {
            console.error("Load Target User Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const [currentTab, setCurrentTab] = useState<"portfolio" | "posts">("portfolio");
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [isSheetVisible, setIsSheetVisible] = useState(false);

    const openPostDetail = (post: any) => {
        // Map local post data to full IPost format for PostCard
        const fullPost = {
            id: post._id,
            userName: user?.name || "User",
            userRole: user?.role || "freelancer",
            userAvatar: user?.avatar,
            caption: post.caption || post.label || "Check out my latest work!",
            postImage: post.imageUrl || post.image,
            likes: post.likes || 0,
            comments: post.comments || 0,
            isLiked: false,
            createdAt: post.createdAt || "Recently",
            tags: post.tags || ["Work", "Design", "Freelance"]
        };
        setSelectedPost(fullPost);
        setIsSheetVisible(true);
    };

    const portfolioPosts = user ? allPosts.filter(p => p.userId === user._id && p.type === "portfolio") : [];
    const socialPosts = user ? allPosts.filter(p => p.userId === user._id && p.type !== "portfolio") : [];

    const handlePostLongPress = (postId: string) => {
        // Mocking the delete/hide functionality
        Platform.OS === "android" || Platform.OS === "ios"
            ? console.log(`Post actions for ${postId}`)
            : null;

        // Simple filter to simulate deletion (stubbed for now as we use context)
        console.log(`Deleting ${postId}`);
    };

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

            {/* Minimal Brand Header */}
            <View style={[styles.headerSolid, { backgroundColor: colors.primary, paddingTop: topInsetOffset + 12, paddingBottom: 25 }]}>
                <View style={styles.headerContent}>
                    {(!isOwnProfile || navigation.canGoBack()) && (
                        <TouchableOpacity
                            style={[styles.headerActionBtn, { marginRight: 12, backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.2)' }]}
                            onPress={() => navigation.goBack()}
                        >
                            <Feather name="arrow-left" size={20} color="#fff" />
                        </TouchableOpacity>
                    )}
                    <View style={styles.headerTitleGroup}>
                        <Text style={[styles.screenHeading, { color: '#fff' }]} numberOfLines={1}>
                            {user?.name || (loading ? "Loading..." : "Profile")}
                        </Text>
                    </View>
                    <View style={styles.headerActionGroup}>
                        {isOwnProfile ? (
                            <TouchableOpacity
                                style={[styles.headerActionBtn, { backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.2)' }]}
                                onPress={() => navigation.navigate("Settings")}
                            >
                                <Feather name="settings" size={20} color="#fff" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={[styles.headerActionBtn, { backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.2)' }]}
                                onPress={() => navigation.navigate("Main", { screen: "Messages", params: { screen: "Chat", params: { id: user?._id } } })}
                            >
                                <Feather name="message-circle" size={20} color="#fff" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            <ScrollView
                style={styles.mainView}
                contentContainerStyle={[styles.scrollContentLayout, { marginTop: -20 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Modern Identity & Stats Row (Instagram Inspired) */}
                <View style={[styles.identityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.topInfoRow}>
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

                        <View style={styles.statsRow}>
                            {[
                                { label: "Followers", value: "2.4K" },
                                { label: "Completed", value: "18" },
                                { label: "Earnings", value: "$4.2K" },
                            ].map((stat) => (
                                <View key={stat.label} style={styles.statItem}>
                                    <Text style={[styles.statValueCompact, { color: colors.foreground }]}>{stat.value}</Text>
                                    <Text style={[styles.statLabelCompact, { color: colors.mutedForeground }]}>{stat.label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.bioSection}>
                        <Text style={[styles.profileNameBold, { color: colors.foreground }]}>{user.name}</Text>
                        {user.tagline ? (
                            <Text style={[styles.taglineText, { color: colors.primary }]}>{user.tagline}</Text>
                        ) : null}
                        
                        <View style={styles.roleBadgeCompact}>
                            <View style={[styles.roleDot, { backgroundColor: roleAccentColor }]} />
                            <Text style={[styles.roleTextCompact, { color: roleAccentColor }]}>{roleName}</Text>
                            {user.location ? (
                                <Text style={[styles.locationText, { color: colors.mutedForeground }]}> • {user.location}</Text>
                            ) : null}
                        </View>

                        {user.role === 'hiring' || user.role === 'requester' ? (
                            <View style={styles.companyInfoRow}>
                                <Feather name="briefcase" size={14} color={colors.mutedForeground} />
                                <Text style={[styles.companyText, { color: colors.foreground }]}>
                                    {user.companyName || "Independent Hirer"} {user.industry ? `• ${user.industry}` : ""}
                                </Text>
                            </View>
                        ) : null}

                        <Text style={[styles.bioBodyText, { color: colors.foreground }]}>
                            {user.bio || (user.role === 'freelancer' 
                                ? "Crafting digital experiences with passion. Senior UI/UX Designer & Frontend Developer specialized in mobile applications."
                                : "Looking for top-tier talent to collaborate on exciting projects and drive innovation.")}
                        </Text>
                    </View>

                    <View style={styles.profileActionRow}>
                        {isOwnProfile ? (
                            <>
                                <TouchableOpacity style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate("ProfileSetup")}>
                                    <Text style={styles.primaryActionBtnText}>Edit Profile</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <TouchableOpacity
                                    style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
                                    onPress={() => navigation.navigate("Main", { screen: "Messages", params: { screen: "Chat", params: { id: user?._id } } })}
                                >
                                    <Text style={styles.primaryActionBtnText}>Message</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.secondaryActionBtn, { backgroundColor: colors.muted + "15", borderColor: colors.border }]}>
                                    <Text style={[styles.secondaryActionBtnText, { color: colors.foreground }]}>Hire Now</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>

                {/* Services Section */}
                {user.services && user.services.length > 0 && (
                    <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.sectionHeader, { color: colors.foreground }]}>Services</Text>
                        <View style={styles.servicesGrid}>
                            {user.services.map((service: string, idx: number) => (
                                <View key={idx} style={[styles.serviceBadge, { backgroundColor: colors.primary + "15" }]}>
                                    <Text style={[styles.serviceBadgeText, { color: colors.primary }]}>{service}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Education & Experience Section */}
                <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.experienceHeaderRow}>
                        <Text style={[styles.sectionHeader, { color: colors.foreground }]}>Experience & Education</Text>
                        <TouchableOpacity style={[styles.addInlineBtn, { backgroundColor: colors.primary + "10" }]} onPress={() => navigation.navigate("Settings")}>
                            <Feather name="edit-3" size={14} color={colors.primary} />
                            <Text style={[styles.addInlineLabel, { color: colors.primary }]}>Manage</Text>
                        </TouchableOpacity>
                    </View>

                    {user.experience && user.experience.map((exp: any, idx: number) => (
                        <View key={`exp-${idx}`} style={[styles.historyItem, idx !== user.experience!.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                            <View style={[styles.historyIconBox, { backgroundColor: colors.purpleAccent + "10" }]}>
                                <Feather name="award" size={18} color={colors.purpleAccent} />
                            </View>
                            <View style={styles.historyContent}>
                                <Text style={[styles.historyTitle, { color: colors.foreground }]}>{exp.role}</Text>
                                <Text style={[styles.historySubtitle, { color: colors.mutedForeground }]}>{exp.company}</Text>
                                <Text style={[styles.historyDate, { color: colors.mutedForeground }]}>{exp.startYear} - {exp.endYear}</Text>
                                {exp.description ? (
                                    <View style={{ marginTop: 8 }}>
                                        <Text style={{ fontSize: 13, lineHeight: 18, color: colors.foreground }}>{exp.description}</Text>
                                    </View>
                                ) : null}
                            </View>
                        </View>
                    ))}

                    {user.education && user.education.map((edu: any, idx: number) => (
                        <View key={`edu-${idx}`} style={[styles.historyItem, idx !== user.education!.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                            <View style={[styles.historyIconBox, { backgroundColor: colors.blueLight }]}>
                                <Feather name="book" size={18} color={colors.primary} />
                            </View>
                            <View style={styles.historyContent}>
                                <Text style={[styles.historyTitle, { color: colors.foreground }]}>{edu.degree}</Text>
                                <Text style={[styles.historySubtitle, { color: colors.mutedForeground }]}>{edu.institution}</Text>
                                <Text style={[styles.historyDate, { color: colors.mutedForeground }]}>{edu.startYear} - {edu.endYear}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Tab Switcher (Instagram Style) */}
                <View style={[styles.tabSwitcher, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity
                        style={[styles.tabItem, currentTab === "portfolio" && { borderBottomColor: colors.primary }]}
                        onPress={() => setCurrentTab("portfolio")}
                    >
                        <Feather name="grid" size={20} color={currentTab === "portfolio" ? colors.primary : colors.mutedForeground} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabItem, currentTab === "posts" && { borderBottomColor: colors.primary }]}
                        onPress={() => setCurrentTab("posts")}
                    >
                        <MCI name="image-multiple-outline" size={22} color={currentTab === "posts" ? colors.primary : colors.mutedForeground} />
                    </TouchableOpacity>
                </View>

                {currentTab === "portfolio" ? (
                    <View style={styles.portfolioGrid}>
                        {portfolioPosts.length > 0 ? portfolioPosts.map(item => (
                            <TouchableOpacity
                                key={item._id}
                                style={[styles.portfolioItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                                activeOpacity={0.9}
                                onPress={() => openPostDetail(item)}
                            >
                                {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.portfolioImage} /> : (
                                    <View style={[styles.portfolioPlaceholder, { backgroundColor: colors.muted + "20" }]}>
                                        <Feather name="image" size={30} color={colors.mutedForeground} />
                                    </View>
                                )}
                                <View style={styles.portfolioOverlay}>
                                    {item.tags?.[0] && (
                                        <View style={styles.itemCategoryBadge}>
                                            <Text style={styles.itemCategoryText}>{item.tags[0]}</Text>
                                        </View>
                                    )}
                                    <Text style={styles.itemLabelText}>{item.caption}</Text>
                                </View>
                            </TouchableOpacity>
                        )) : (
                            <View style={styles.emptyGridState}>
                                <Feather name="plus-circle" size={40} color={colors.mutedForeground} />
                                <Text style={[styles.emptyGridText, { color: colors.mutedForeground }]}>Add your first portfolio piece</Text>
                                <TouchableOpacity style={[styles.addPostBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate("CreatePost")}>
                                    <Text style={styles.addPostBtnLabel}>Add Work</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={styles.postsGrid}>
                        {socialPosts.map(post => (
                            <TouchableOpacity
                                key={post._id}
                                style={styles.postGridItem}
                                activeOpacity={0.8}
                                onPress={() => openPostDetail(post)}
                                onLongPress={() => handlePostLongPress(post._id)}
                            >
                                <Image source={{ uri: post.imageUrl || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000&auto=format&fit=crop" }} style={styles.postGridImage} />
                                <View style={styles.postGridStats}>
                                    <View style={styles.postGridStatItem}>
                                        <Ionicons name="heart" size={12} color="#fff" />
                                        <Text style={styles.postGridStatText}>{post.likes}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

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

            {/* Post Detail "Bottom Sheet" Modal */}
            <Modal
                visible={isSheetVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setIsSheetVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsSheetVisible(false)}
                >
                    <View style={[styles.sheetContent, { backgroundColor: colors.background }]}>
                        <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
                        <View style={styles.sheetHeader}>
                            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Post Details</Text>
                            <TouchableOpacity onPress={() => setIsSheetVisible(false)} style={styles.sheetCloseBtn}>
                                <Ionicons name="close" size={24} color={colors.foreground} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {selectedPost && (
                                <PostCard
                                    post={selectedPost}
                                    onLike={() => { }} // Local state update could be added if needed
                                />
                            )}
                            <View style={{ height: 100 }} />
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
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
        padding: 20,
        paddingTop: 30, // Increased to fix stat visibility
        marginBottom: 20,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.04,
        shadowRadius: 15,
        elevation: 3,
    },
    sectionCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 16,
    },
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    serviceBadge: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    serviceBadgeText: {
        fontSize: 13,
        fontWeight: '700',
    },
    experienceHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    addInlineBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    addInlineLabel: {
        fontSize: 12,
        fontWeight: '700',
    },
    historyItem: {
        flexDirection: 'row',
        gap: 16,
        paddingVertical: 16,
    },
    historyIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    historyContent: {
        flex: 1,
    },
    historyTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    historySubtitle: {
        fontSize: 13,
        fontWeight: '500',
        marginTop: 2,
    },
    historyDate: {
        fontSize: 12,
        fontWeight: '400',
        marginTop: 4,
    },
    portfolioPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyGridState: {
        width: '100%',
        paddingVertical: 40,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    emptyGridText: {
        fontSize: 14,
        fontWeight: '500',
    },
    addPostBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        marginTop: 8,
    },
    addPostBtnLabel: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    topInfoRow: {
        flexDirection: "row",
        alignItems: "flex-start", // Changed from center to align with avatar top
        justifyContent: "space-between",
        marginBottom: 20,
    },
    avatarWrapper: { position: "relative" },
    avatarBorder: {
        width: 86,
        height: 86,
        borderRadius: 43,
        borderWidth: 2,
        padding: 3,
        alignItems: "center",
        justifyContent: "center",
    },
    mainAvatarImg: { width: 76, height: 76, borderRadius: 38 },
    avatarFallback: { width: 76, height: 76, borderRadius: 38, alignItems: "center", justifyContent: "center" },
    avatarInitialText: { color: "#fff", fontSize: 32, fontWeight: '700' },
    editAvatarBadge: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#fff",
    },
    statsRow: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-around",
        marginLeft: 10,
    },
    statItem: {
        alignItems: "center",
    },
    statValueCompact: {
        fontSize: 18,
        fontWeight: '800',
    },
    statLabelCompact: {
        fontSize: 11,
        fontWeight: '500',
        marginTop: 2,
    },
    bioSection: {
        marginBottom: 20,
    },
    profileNameBold: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 4,
    },
    roleBadgeCompact: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        gap: 6,
    },
    roleDot: { width: 6, height: 6, borderRadius: 3 },
    roleTextCompact: {
        fontSize: 11,
        fontWeight: '800',
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    emailText: {
        fontSize: 12,
        fontWeight: '400',
    },
    bioBodyText: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
        marginTop: 8,
    },
    taglineText: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
    },
    locationText: {
        fontSize: 12,
        fontWeight: '500',
    },
    companyInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
        backgroundColor: 'rgba(0,0,0,0.03)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    companyText: {
        fontSize: 13,
        fontWeight: '600',
    },
    profileActionRow: {
        flexDirection: "row",
        gap: 10,
    },
    primaryActionBtn: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    primaryActionBtnText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: '700',
    },
    secondaryActionBtn: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
    },
    secondaryActionBtnText: {
        fontSize: 14,
        fontWeight: '700',
    },
    tabSwitcher: {
        flexDirection: "row",
        borderBottomWidth: 1,
        marginBottom: 20,
    },
    tabItem: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 2,
        borderBottomColor: "transparent",
    },
    portfolioGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
    postsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 2,
        marginBottom: 24,
    },
    postGridItem: {
        width: (width - 36) / 3, // 3 column grid with minor gap
        aspectRatio: 1,
        position: "relative",
    },
    postGridImage: {
        width: "100%",
        height: "100%",
    },
    postGridStats: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.2)",
        justifyContent: "center",
        alignItems: "center",
        opacity: 0, // Hidden by default, could be shown on hover/active in web or just simplify
    },
    postGridStatItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    postGridStatText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "700",
    },
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
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    sheetContent: {
        height: '85%',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 12,
    },
    sheetHandle: {
        width: 40,
        height: 5,
        borderRadius: 2.5,
        alignSelf: "center",
        marginBottom: 12,
    },
    sheetHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    sheetCloseBtn: {
        padding: 5,
    },
});
