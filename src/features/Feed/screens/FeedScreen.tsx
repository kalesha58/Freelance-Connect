import React, { useState } from "react";
import {
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";

import { IPost, PostCard } from "@/components/PostCard/PostCard";
import { useColors } from "@/hooks/useColors";

const MOCK_POSTS: IPost[] = [
    {
        id: "1",
        userName: "Sarah Chen",
        userRole: "freelancer",
        userAvatar: "https://i.pravatar.cc/150?u=sarah",
        caption: "Just finished a major UI redesign for a fintech startup! Really happy with how the animations turned out. The flow is now 40% faster for end users. Exploring more glassmorphism today! 🎨✨",
        postImage: "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1000&auto=format&fit=crop",
        likes: 1245,
        comments: 48,
        isLiked: true,
        createdAt: "2h ago",
        tags: ["UXDesign", "MobileApp", "DesignInspo"],
    },
    {
        id: "2",
        userName: "TechSolutions",
        userRole: "hiring",
        userAvatar: "https://i.pravatar.cc/150?u=tech",
        caption: "We are actively looking for React Native developers for a 3-month contract. Check out the job board for details! High priority request for candidates in New York. 🚀",
        postImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop",
        likes: 56,
        comments: 12,
        isLiked: false,
        createdAt: "5h ago",
        tags: ["Hiring", "ReactNative", "Engineering"],
    },
    {
        id: "3",
        userName: "Marcus Johnson",
        userRole: "freelancer",
        userAvatar: "https://i.pravatar.cc/150?u=marcus",
        caption: "Late night coding sessions are where the magic happens! Just optimized the database queries for the upcoming freelance portal. Stay tuned! 💻🔥",
        postImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000&auto=format&fit=crop",
        likes: 892,
        comments: 24,
        isLiked: false,
        createdAt: "1d ago",
        tags: ["FullStack", "CleanCode", "FreelanceLife"],
    }
];

/**
 * FeedScreen displays a community stream of posts and updates.
 * Redesigned for an Instagram-style immersive visual experience.
 */
export default function FeedScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const [posts, setPosts] = useState(MOCK_POSTS);

    const handleLike = (id: string) => {
        setPosts(prev => prev.map(post => {
            if (post.id === id) {
                return {
                    ...post,
                    isLiked: !post.isLiked,
                    likes: post.isLiked ? post.likes - 1 : post.likes + 1
                };
            }
            return post;
        }));
    };

    return (
        <View style={[styles.feedRootView, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

            {/* Solid Brand Header (Instagram Style Header) */}
            <View style={[styles.headerSolid, { backgroundColor: colors.primary, paddingTop: insets.top }]}>
                <View style={styles.headerTitleRow}>
                    <Text style={[styles.screenHeading, { color: '#fff' }]}>Community</Text>
                    <View style={styles.headerActionGroup}>
                        <TouchableOpacity style={styles.headerIconBtn}>
                            <Feather name="heart" size={24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.headerIconBtn}
                            onPress={() => navigation.navigate("CreatePost")}
                        >
                            <Feather name="plus-square" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <PostCard
                        post={item}
                        onLike={handleLike}
                    />
                )}
                contentContainerStyle={[styles.feedListContent, { paddingBottom: 100 }]}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                    <View style={styles.emptyFeedPlaceholder}>
                        <Feather name="image" size={48} color={colors.mutedForeground} />
                        <Text style={[styles.emptyFeedTitle, { color: colors.foreground }]}>No posts yet</Text>
                        <Text style={[styles.emptyFeedCopy, { color: colors.mutedForeground }]}>Be the first to share something!</Text>
                    </View>
                )}
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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 10,
    },
    headerTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    screenHeading: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
    headerActionGroup: {
        flexDirection: "row",
        alignItems: "center",
        gap: 18,
    },
    headerIconBtn: {
        padding: 4,
    },
    emptyFeedPlaceholder: { alignItems: "center", paddingTop: 100, gap: 10 },
    emptyFeedTitle: { fontSize: 18, fontWeight: '700' },
    emptyFeedCopy: { fontSize: 14, fontWeight: '400' },
});
