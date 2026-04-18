import React, { useCallback, useEffect, useState } from "react";
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
    ActivityIndicator,
    RefreshControl,
    Linking,
    Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { PostCard } from "@/components/PostCard/PostCard";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { apiClient } from "@/utils/apiClient";
import { formatNumber } from "@/utils/formatters";
import { normalizeHttpUrl } from "@/utils/urlHelpers";
import { RootStackParamList } from "@/navigation/types";

const { width } = Dimensions.get('window');

type UserProfileRouteProp = RouteProp<RootStackParamList, 'UserProfile'>;

/**
 * UserProfileScreen provides a modern public view of a user's professional identity.
 * Displays their bio, stats, portfolio pieces, and communal posts.
 */
export default function UserProfileScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const route = useRoute<UserProfileRouteProp>();
    const { userId } = route.params;

    const { user: currentUser, posts: allPosts, refreshCurrentUser } = useApp();
    const [targetUser, setTargetUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentTab, setCurrentTab] = useState<"posts" | "portfolio">("posts");
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    const isOwnProfile = userId === currentUser?._id;

    const loadProfile = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiClient(`/profile/${userId}`);
            setTargetUser(data);
            
            // Check follow status if not own profile
            if (!isOwnProfile && currentUser) {
                try {
                    const status = await apiClient(`/follow/status/${userId}`);
                    setIsFollowing(!!status.isFollowing);
                } catch (e) {
                    console.error("Follow Status Error:", e);
                }
            }
        } catch (error) {
            console.error("Load User Profile Error:", error);
            Alert.alert("Error", "Could not load profile. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [userId, isOwnProfile, currentUser]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadProfile();
        setRefreshing(false);
    };

    const handleFollowToggle = async () => {
        if (!userId || followLoading) return;
        setFollowLoading(true);
        try {
            if (isFollowing) {
                await apiClient(`/follow/${userId}`, { method: "DELETE" });
                setIsFollowing(false);
                setTargetUser((prev: any) => prev ? { ...prev, followers: Math.max(0, (prev.followers || 0) - 1) } : prev);
            } else {
                await apiClient(`/follow/${userId}`, { method: "POST" });
                setIsFollowing(true);
                setTargetUser((prev: any) => prev ? { ...prev, followers: (prev.followers || 0) + 1 } : prev);
            }
            await refreshCurrentUser();
        } catch (e: any) {
            Alert.alert("Follow Error", e.message || "Something went wrong.");
        } finally {
            setFollowLoading(false);
        }
    };

    const handleMessagePress = () => {
        navigation.navigate("Chat", { id: userId });
    };

    if (loading && !targetUser) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!targetUser) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.foreground }}>User not found.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: colors.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const userPosts = allPosts.filter(p => p.userId === userId && p.type !== "portfolio");
    const portfolioPosts = allPosts.filter(p => p.userId === userId && p.type === "portfolio");
    
    const roleAccentColor = targetUser.role === "freelancer" ? colors.primary : colors.purpleAccent;
    const roleName = targetUser.role === "freelancer" ? "Freelancer" : "Hiring Partner";

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Premium Header */}
            <View style={[styles.header, { backgroundColor: colors.headerBackground, paddingTop: insets.top + 10 }]}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                        <Feather name="arrow-left" size={22} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>{targetUser.name}</Text>
                    <TouchableOpacity style={styles.headerBtn}>
                        <Feather name="more-horizontal" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            >
                {/* Profile Identity Section */}
                <View style={[styles.profileInfo, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                    <View style={styles.topRow}>
                        <View style={[styles.avatarBorder, { borderColor: roleAccentColor }]}>
                            {targetUser.avatar || targetUser.profilePic ? (
                                <Image source={{ uri: targetUser.avatar || targetUser.profilePic }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatarPlaceholder, { backgroundColor: roleAccentColor }]}>
                                    <Text style={styles.avatarInitial}>{targetUser.name.charAt(0)}</Text>
                                </View>
                            )}
                        </View>
                        
                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: colors.foreground }]}>{formatNumber(userPosts.length)}</Text>
                                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Posts</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: colors.foreground }]}>{formatNumber(targetUser.followers || 0)}</Text>
                                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Followers</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: colors.foreground }]}>{formatNumber(targetUser.projectsCompleted || 0)}</Text>
                                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Jobs</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.bioContainer}>
                        <Text style={[styles.name, { color: colors.foreground }]}>{targetUser.name}</Text>
                        <View style={styles.roleBadge}>
                            <View style={[styles.roleDot, { backgroundColor: roleAccentColor }]} />
                            <Text style={[styles.roleText, { color: roleAccentColor }]}>{roleName}</Text>
                            {targetUser.location && (
                                <Text style={[styles.location, { color: colors.mutedForeground }]}> • {targetUser.location}</Text>
                            )}
                        </View>
                        {targetUser.tagline && (
                            <Text style={[styles.tagline, { color: colors.primary }]}>{targetUser.tagline}</Text>
                        )}
                        <Text style={[styles.bioText, { color: colors.foreground }]}>
                            {targetUser.bio || "No bio available."}
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionRow}>
                        {!isOwnProfile ? (
                            <>
                                <TouchableOpacity 
                                    style={[
                                        styles.primaryBtn, 
                                        { backgroundColor: isFollowing ? colors.muted + "20" : colors.primary }
                                    ]}
                                    onPress={handleFollowToggle}
                                    disabled={followLoading}
                                >
                                    {followLoading ? (
                                        <ActivityIndicator size="small" color={isFollowing ? colors.foreground : "#fff"} />
                                    ) : (
                                        <Text style={[styles.btnText, { color: isFollowing ? colors.foreground : "#fff" }]}>
                                            {isFollowing ? "Following" : "Follow"}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.secondaryBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                                    onPress={handleMessagePress}
                                >
                                    <Text style={[styles.secondaryBtnText, { color: colors.foreground }]}>Message</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity 
                                style={[styles.primaryBtn, { backgroundColor: colors.buttonPrimary }]}
                                onPress={() => navigation.navigate("EditProfile")}
                            >
                                <Text style={[styles.btnText, { color: colors.onButtonPrimary }]}>Edit Profile</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Content Tabs */}
                <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity 
                        style={[styles.tabItem, currentTab === "posts" && { borderBottomColor: colors.primary }]}
                        onPress={() => setCurrentTab("posts")}
                    >
                        <Feather name="grid" size={20} color={currentTab === "posts" ? colors.primary : colors.mutedForeground} />
                    </TouchableOpacity>
                    {targetUser.role === "freelancer" && (
                        <TouchableOpacity 
                            style={[styles.tabItem, currentTab === "portfolio" && { borderBottomColor: colors.primary }]}
                            onPress={() => setCurrentTab("portfolio")}
                        >
                            <Feather name="layers" size={20} color={currentTab === "portfolio" ? colors.primary : colors.mutedForeground} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Grid Content */}
                {currentTab === "posts" ? (
                    <View style={styles.grid}>
                        {userPosts.length > 0 ? (
                            userPosts.map((post) => (
                                <TouchableOpacity 
                                    key={post._id} 
                                    style={styles.gridItem}
                                    onPress={() => navigation.navigate("PostComments", { postId: post._id, ...post })}
                                >
                                    <Image source={{ uri: post.imageUrl }} style={styles.gridImage} />
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={styles.emptyGrid}>
                                <Feather name="image" size={40} color={colors.mutedForeground} />
                                <Text style={{ color: colors.mutedForeground, marginTop: 10 }}>No posts yet</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={styles.grid}>
                        {portfolioPosts.length > 0 ? (
                            portfolioPosts.map((post) => (
                                <TouchableOpacity 
                                    key={post._id} 
                                    style={styles.gridItem}
                                    onPress={() => navigation.navigate("PostComments", { postId: post._id, ...post })}
                                >
                                    <View>
                                        <Image source={{ uri: post.imageUrl }} style={styles.gridImage} />
                                        <View style={styles.portfolioOverlay}>
                                            <Text style={styles.portfolioTitle} numberOfLines={1}>{post.caption}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={styles.emptyGrid}>
                                <Feather name="briefcase" size={40} color={colors.mutedForeground} />
                                <Text style={{ color: colors.mutedForeground, marginTop: 10 }}>No portfolio items</Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: { paddingBottom: 15 },
    headerContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
    headerBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    headerTitle: { fontSize: 18, fontWeight: "700", color: "#fff", flex: 1, textAlign: "center", marginHorizontal: 10 },
    profileInfo: { padding: 20, borderBottomWidth: 1 },
    topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 15 },
    avatarBorder: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, padding: 3, alignItems: "center", justifyContent: "center" },
    avatar: { width: 78, height: 78, borderRadius: 39 },
    avatarPlaceholder: { width: 78, height: 78, borderRadius: 39, alignItems: "center", justifyContent: "center" },
    avatarInitial: { color: "#fff", fontSize: 32, fontWeight: "800" },
    statsContainer: { flex: 1, flexDirection: "row", justifyContent: "space-around", marginLeft: 15 },
    statItem: { alignItems: "center" },
    statValue: { fontSize: 17, fontWeight: "800" },
    statLabel: { fontSize: 11, fontWeight: "500", marginTop: 2 },
    bioContainer: { marginBottom: 20 },
    name: { fontSize: 18, fontWeight: "800", marginBottom: 4 },
    roleBadge: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
    roleDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    roleText: { fontSize: 11, fontWeight: "800", textTransform: "uppercase" },
    location: { fontSize: 12, fontWeight: "400" },
    tagline: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
    bioText: { fontSize: 14, lineHeight: 20 },
    actionRow: { flexDirection: "row", gap: 10 },
    primaryBtn: { flex: 1, height: 42, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    secondaryBtn: { flex: 1, height: 42, borderRadius: 10, alignItems: "center", justifyContent: "center", borderWidth: 1 },
    btnText: { fontSize: 14, fontWeight: "700" },
    secondaryBtnText: { fontSize: 14, fontWeight: "700" },
    tabBar: { flexDirection: "row", borderBottomWidth: 1 },
    tabItem: { flex: 1, alignItems: "center", paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "transparent" },
    grid: { flexDirection: "row", flexWrap: "wrap" },
    gridItem: { width: width / 3, height: width / 3, borderWidth: 0.5, borderColor: "rgba(0,0,0,0.05)" },
    gridImage: { width: "100%", height: "100%" },
    emptyGrid: { width: "100%", paddingVertical: 60, alignItems: "center", justifyContent: "center" },
    portfolioOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 8, backgroundColor: "rgba(0,0,0,0.4)" },
    portfolioTitle: { color: "#fff", fontSize: 10, fontWeight: "600" },
});
