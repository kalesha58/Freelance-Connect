import React, { useState } from "react";
import {
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    StatusBar,
    RefreshControl
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";

import { IPost, PostCard } from "@/components/PostCard/PostCard";
import { useColors } from "@/hooks/useColors";

import { useApp } from "@/context/AppContext";

/**
 * FeedScreen displays a community stream of posts and updates.
 * Redesigned for an Instagram-style immersive visual experience.
 */
export default function FeedScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { posts, fetchPosts, toggleLike } = useApp();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchPosts();
        setRefreshing(false);
    };

    return (
        <View style={[styles.feedRootView, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

            {/* Solid Brand Header (Instagram Style Header) */}
            <View style={[styles.headerSolid, { backgroundColor: colors.primary, paddingTop: insets.top }]}>
                <View style={styles.headerTitleRow}>
                    <Text style={[styles.screenHeading, { color: '#fff' }]}>Community</Text>
                    <View style={styles.headerActionGroup}>
                        <TouchableOpacity
                            style={styles.headerIconBtn}
                            onPress={() => navigation.navigate("CreatePost")}
                        >
                            <Feather name="plus-square" size={24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.headerIconBtn}
                            onPress={() => navigation.navigate("Messages")}
                        >
                            <Feather name="message-circle" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <FlatList
                data={posts}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <PostCard
                        post={{
                            ...item,
                            id: item._id, // Map backend _id to frontend component id
                            postImage: item.imageUrl // Map backend imageUrl to component postImage
                        } as any}
                        onLike={toggleLike}
                    />
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
                contentContainerStyle={[
                    styles.feedListContent,
                    { paddingBottom: 80 + insets.bottom }
                ]}
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
