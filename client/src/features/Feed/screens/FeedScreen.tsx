import React, { useMemo, useState } from "react";
import {
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    StatusBar,
    RefreshControl,
    TextInput,
    Animated as RNAnimated
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";

import { IPost, PostCard } from "@/components/PostCard/PostCard";
import { useColors } from "@/hooks/useColors";
import { PostCardSkeleton } from "@/components/SkeletonLoader";
import { StatusRow } from "@/components/StatusRow/StatusRow";
import { useApp } from "@/context/AppContext";

/**
 * FeedScreen displays a community stream of posts and updates.
 * Optimized with search functionality and refined navigation UI.
 */
export default function FeedScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { posts, fetchPosts, toggleLike, isLoading } = useApp();
    
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchActive, setIsSearchActive] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchPosts();
        setRefreshing(false);
    };

    const filteredPosts = useMemo(() => {
        if (!searchQuery.trim()) return posts;
        const query = searchQuery.toLowerCase();
        return posts.filter(post => 
            post.caption?.toLowerCase().includes(query) || 
            post.userName?.toLowerCase().includes(query) ||
            post.tags?.some(tag => tag.toLowerCase().includes(query))
        );
    }, [posts, searchQuery]);

    const toggleSearch = () => {
        setIsSearchActive(!isSearchActive);
        if (isSearchActive) setSearchQuery("");
    };

    return (
        <View style={[styles.feedRootView, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor={colors.headerBackground} />

            {/* Premium Solid Header */}
            <View style={[styles.headerSolid, { backgroundColor: colors.headerBackground, paddingTop: insets.top }]}>
                <View style={styles.headerTitleRow}>
                    {!isSearchActive ? (
                        <>
                            <Text style={[styles.screenHeading, { color: '#fff' }]}>Community</Text>
                            <View style={styles.headerActionGroup}>
                                <TouchableOpacity style={styles.headerIconBtn} onPress={toggleSearch}>
                                    <Feather name="search" size={22} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.headerIconBtn}
                                    onPress={() => navigation.navigate("CreatePost")}
                                >
                                    <Feather name="plus-square" size={22} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.headerIconBtn}
                                    onPress={() => navigation.navigate("Messages")}
                                >
                                    <Feather name="message-circle" size={22} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <View style={styles.searchHeaderWrapper}>
                            <View style={[styles.searchBarInner, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                                <Feather name="search" size={18} color="#fff" />
                                <TextInput
                                    placeholder="Search posts, users, tags..."
                                    placeholderTextColor="rgba(255,255,255,0.6)"
                                    style={styles.searchInput}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    autoFocus
                                    autoCorrect={false}
                                    returnKeyType="search"
                                />
                                {searchQuery.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                                        <Ionicons name="close-circle" size={20} color="#fff" />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <TouchableOpacity onPress={toggleSearch} style={styles.cancelSearchBtn}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

            <FlatList
                data={filteredPosts}
                keyExtractor={(item) => item._id}
                ListHeaderComponent={() => <StatusRow />}
                renderItem={({ item }) => (
                    <PostCard
                        post={{
                            ...item,
                            id: item._id, 
                            postImage: item.imageUrl 
                        } as any}
                        onLike={toggleLike}
                        onFollowChanged={fetchPosts}
                    />
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.headerBackground]}
                        tintColor={colors.headerBackground}
                    />
                }
                contentContainerStyle={[
                    styles.feedListContent,
                    { paddingBottom: 100 + insets.bottom } // Increased to avoid tab bar overlap
                ]}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => {
                    if (isLoading) {
                        return (
                            <View style={{ paddingVertical: 10 }}>
                                <PostCardSkeleton />
                                <PostCardSkeleton />
                            </View>
                        );
                    }
                    return (
                        <View style={styles.emptyFeedPlaceholder}>
                            <Feather name="search" size={48} color={colors.mutedForeground} />
                            <Text style={[styles.emptyFeedTitle, { color: colors.foreground }]}>
                                {searchQuery ? "No results found" : "No posts yet"}
                            </Text>
                            <Text style={[styles.emptyFeedCopy, { color: colors.mutedForeground }]}>
                                {searchQuery ? "Try searching for something else" : "Be the first to share something!"}
                            </Text>
                        </View>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    feedRootView: { flex: 1 },
    feedListContent: { paddingBottom: 20 },
    headerSolid: {
        width: '100%',
        paddingBottom: 12,
        zIndex: 10,
    },
    headerTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 10,
        height: 50,
    },
    screenHeading: { fontSize: 24, fontWeight: '800', letterSpacing: -0.8 },
    headerActionGroup: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    headerIconBtn: {
        padding: 4,
    },
    searchHeaderWrapper: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    searchBarInner: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        height: 40,
        borderRadius: 20,
        paddingHorizontal: 12,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        color: "#fff",
        fontSize: 15,
        paddingVertical: 0,
    },
    cancelSearchBtn: {
        paddingVertical: 8,
    },
    cancelText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },
    emptyFeedPlaceholder: { alignItems: "center", paddingTop: 100, gap: 10 },
    emptyFeedTitle: { fontSize: 18, fontWeight: '700' },
    emptyFeedCopy: { fontSize: 14, fontWeight: '400' },
});
