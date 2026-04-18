import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    ActivityIndicator,
    Alert,
} from "react-native";
import Animated, { 
    useAnimatedStyle, 
    useSharedValue, 
    withSpring, 
    withTiming, 
    withDelay 
} from "react-native-reanimated";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";

import { useColors } from "@/hooks/useColors";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import { UserRole } from "@/types/auth";
import { useApp } from "@/context/AppContext";
import { apiClient } from "@/utils/apiClient";
import { ShareBottomSheet } from "@/components/ShareBottomSheet/ShareBottomSheet";


/**
 * Interface representing content shared by users in the activity feed.
 */
export interface IPost {
    id: string;
    _id?: string;
    userId: string;
    userName: string;
    userRole: UserRole;
    userAvatar?: string;
    caption: string;
    postImage?: string;
    imageUrl?: string;
    likes: string[];      // array of user IDs
    likedByMe: boolean;
    comments: any[];      // raw comment objects
    isLiked?: boolean;    // legacy fallback
    createdAt: string;
    tags: string[];
    /** From GET /posts when viewer is a freelancer — whether they follow the author. */
    isFollowingAuthor?: boolean;
}

/**
 * Properties for the PostCard component.
 */
interface IPostCardProps {
    post: IPost;
    onLike: (id: string) => void;
    /** Refetch feed after follow/unfollow so counts and flags stay in sync. */
    onFollowChanged?: () => void | Promise<void>;
}

/**
 * Component for rendering an Instagram-style community card.
 * Highlights visual content and follows modern social feed patterns.
 */
function PostCardInner({ post, onLike, onFollowChanged }: IPostCardProps) {
    const colors = useColors();
    const { user, refreshCurrentUser, deletePost } = useApp();
    const navigation = useNavigation<any>();
    const [following, setFollowing] = React.useState(post.isFollowingAuthor ?? false);
    const [followLoading, setFollowLoading] = React.useState(false);
    const [showShareSheet, setShowShareSheet] = React.useState(false);


    React.useEffect(() => {
        setFollowing(post.isFollowingAuthor ?? false);
    }, [post.isFollowingAuthor, post.userId]);
    const iconScaleValue = useSharedValue(1);
    const bigHeartScale = useSharedValue(0);
    const bigHeartOpacity = useSharedValue(0);

    const heartAnimationStyle = useAnimatedStyle(() => ({
        transform: [{ scale: iconScaleValue.value }],
    }));

    const bigHeartStyle = useAnimatedStyle(() => ({
        transform: [{ scale: bigHeartScale.value }],
        opacity: bigHeartOpacity.value,
    }));

    const triggerBigHeartAnimation = () => {
        // Initial state
        bigHeartScale.value = 0;
        bigHeartOpacity.value = 1;

        // Snappy pop-in
        bigHeartScale.value = withSpring(1.2, { damping: 10, stiffness: 100 }, () => {
            bigHeartScale.value = withSpring(1.0, { damping: 10, stiffness: 100 });
        });

        // Fade out after a delay (Total visible time: 2s)
        bigHeartOpacity.value = withDelay(1500, withTiming(0, { duration: 500 }));
    };

    const handleLikeInteraction = () => {
        const isCurrentlyLiked = post.likedByMe ?? post.isLiked ?? false;
        
        // Only trigger big heart when liking (not unliking)
        if (!isCurrentlyLiked) {
            triggerBigHeartAnimation();
        }

        iconScaleValue.value = withSpring(1.5, { damping: 10, stiffness: 100 }, () => {
            iconScaleValue.value = withSpring(1);
        });
        
        onLike(post.id || post._id || '');
    };

    // Double tap detection
    const lastTap = React.useRef(0);
    const handleImagePress = () => {
        const now = Date.now();
        if (lastTap.current && (now - lastTap.current) < 300) {
            // Only like on double tap if NOT already liked
            const isCurrentlyLiked = post.likedByMe ?? post.isLiked ?? false;
            if (!isCurrentlyLiked) {
                handleLikeInteraction();
            } else {
                // If already liked, still show big heart but don't toggle
                triggerBigHeartAnimation();
            }
        } else {
            lastTap.current = now;
        }
    };

    const handleCommentPress = () => {
        navigation.navigate("PostComments", {
            postId: post.id || post._id,
            postOwnerId: post.userId,
            caption: post.caption,
            userName: post.userName,
            userAvatar: post.userAvatar,
            likesCount: Array.isArray(post.likes) ? post.likes.length : 0,
        });
    };
    
    const handleProfilePress = () => {
        navigation.navigate("UserProfile", { userId: post.userId });
    };

    const formattedRoleLabel = post.userRole === "freelancer" ? "Freelancer" : "Hiring Partner";
    const roleDisplayColor = post.userRole === "freelancer" ? colors.primary : colors.purpleAccent;
    const isLiked = post.likedByMe ?? post.isLiked ?? false;
    const rawLikes = post.likes as any;
    const likesCount = Array.isArray(rawLikes) ? rawLikes.length : (Number(rawLikes) || 0);
    const commentsCount = Array.isArray(post.comments) ? post.comments.length : (Number(post.comments) || 0);

    const authorId = String(post.userId ?? "");
    const myId = user?._id ? String(user._id) : "";
    const showFollow =
        user?.role === "freelancer" &&
        post.userRole === "freelancer" &&
        !!authorId &&
        !!myId &&
        authorId !== myId;

    const handleFollowPress = async () => {
        if (!showFollow || followLoading || !authorId) return;
        setFollowLoading(true);
        const next = !following;
        setFollowing(next);
        try {
            if (next) {
                await apiClient(`/follow/${authorId}`, { method: "POST" });
            } else {
                await apiClient(`/follow/${authorId}`, { method: "DELETE" });
            }
            await refreshCurrentUser();
            await onFollowChanged?.();
        } catch (e: unknown) {
            setFollowing(!next);
            const msg = e instanceof Error ? e.message : "Try again.";
            Alert.alert("Follow", msg);
        } finally {
            setFollowLoading(false);
        }
    };

    const handleMorePress = () => {
        const isOwner = myId === authorId;
        
        if (isOwner) {
            Alert.alert(
                "Post Options",
                "What would you like to do with this post?",
                [
                    {
                        text: "Delete Post",
                        style: "destructive",
                        onPress: () => {
                            Alert.alert(
                                "Delete Post",
                                "Are you sure you want to delete this post? This action cannot be undone.",
                                [
                                    { text: "Cancel", style: "cancel" },
                                    { 
                                        text: "Delete", 
                                        style: "destructive", 
                                        onPress: async () => {
                                            try {
                                                await deletePost(post.id || post._id || "");
                                            } catch (e: any) {
                                                Alert.alert("Error", e.message || "Failed to delete post");
                                            }
                                        }
                                    }
                                ]
                            );
                        }
                    },
                    { text: "Cancel", style: "cancel" }
                ]
            );
        } else {
            // Options for other people's posts (e.g., Report)
            Alert.alert(
                "Post Options",
                "Report this post if it violates our community guidelines.",
                [
                    { 
                        text: "Report Post", 
                        onPress: () => navigation.navigate("Report", { 
                            targetId: post.id || post._id,
                            targetType: 'post'
                        }) 
                    },
                    { text: "Cancel", style: "cancel" }
                ]
            );
        }
    };

    return (
        <View style={[styles.cardSurface, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Header: User Info */}
            <View style={styles.cardHeaderArea}>
                <TouchableOpacity 
                    style={styles.userInfoRow} 
                    onPress={handleProfilePress}
                    activeOpacity={0.7}
                >
                    {post.userAvatar ? (
                        <Image source={{ uri: post.userAvatar }} style={styles.profileAvatarImg} />
                    ) : (
                        <View style={[styles.profileAvatarPlaceholder, { backgroundColor: colors.headerBackground }]}>
                            <Text style={styles.avatarLabel}>{post.userName.charAt(0)}</Text>
                        </View>
                    )}
                    <View style={styles.headerMetaData}>
                        <Text style={[styles.postAuthorName, { color: colors.foreground }]} numberOfLines={1}>
                            {post.userName}
                        </Text>
                        <View style={styles.authorBadgeRow}>
                            <View style={[styles.roleIndicatorDot, { backgroundColor: roleDisplayColor }]} />
                            <Text style={[styles.roleLabelText, { color: roleDisplayColor }]}>{formattedRoleLabel}</Text>
                            <Text style={[styles.postTimestamp, { color: colors.mutedForeground }]}> • {formatRelativeTime(post.createdAt)}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
                <View style={styles.headerRightCluster}>
                    {showFollow && (
                        <TouchableOpacity
                            style={[
                                styles.followPill,
                                following
                                    ? { borderColor: colors.border, backgroundColor: colors.card }
                                    : { borderColor: colors.primary, backgroundColor: colors.card },
                            ]}
                            onPress={handleFollowPress}
                            disabled={followLoading}
                            activeOpacity={0.7}
                        >
                            {followLoading ? (
                                <ActivityIndicator size="small" color={colors.primary} />
                            ) : (
                                <Text
                                    style={[
                                        styles.followPillText,
                                        { color: following ? colors.mutedForeground : colors.primary },
                                    ]}
                                >
                                    {following ? "Following" : "Follow"}
                                </Text>
                            )}
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.moreBtn} onPress={handleMorePress}>
                        <Feather name="more-horizontal" size={20} color={colors.mutedForeground} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Post Content: Image (Instagram Style) */}
            {(post.postImage || post.imageUrl) && (
                <TouchableOpacity activeOpacity={1} onPress={handleImagePress} style={styles.imageContainer}>
                    <Image
                        source={{ uri: post.postImage || post.imageUrl }}
                        style={styles.postMediaImage}
                        resizeMode="cover"
                    />
                    {/* Big Heart Popup Overlay */}
                    <Animated.View style={[styles.bigHeartContainer, bigHeartStyle]}>
                        <Ionicons name="heart" size={80} color="#fff" />
                    </Animated.View>
                </TouchableOpacity>
            )}


            {/* Engagement Bar */}
            <View style={styles.postEngagementActions}>
                <View style={styles.actionGroupLeft}>
                    <TouchableOpacity style={styles.actionItemBtn} onPress={handleLikeInteraction} activeOpacity={0.7}>
                        <Animated.View style={heartAnimationStyle}>
                            <Ionicons
                                name={isLiked ? "heart" : "heart-outline"}
                                size={26}
                                color={isLiked ? colors.destructive : colors.foreground}
                            />
                        </Animated.View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionItemBtn} activeOpacity={0.7} onPress={handleCommentPress}>
                        <MaterialCommunityIcons name="comment-outline" size={24} color={colors.foreground} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionItemBtn} activeOpacity={0.7} onPress={() => setShowShareSheet(true)}>
                        <Feather name="send" size={22} color={colors.foreground} />
                    </TouchableOpacity>

                </View>

                <TouchableOpacity activeOpacity={0.7}>
                    <Feather name="bookmark" size={24} color={colors.foreground} />
                </TouchableOpacity>
            </View>

            {/* Likes Count */}
            <Text style={[styles.likesCountText, { color: colors.foreground }]}>
                {likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}
            </Text>

            {/* Caption Section */}
            <View style={styles.captionSection}>
                <Text style={[styles.captionContent, { color: colors.foreground }]}>
                    <Text 
                        style={styles.captionUser}
                        onPress={handleProfilePress}
                    >
                        {post.userName}{' '}
                    </Text>
                    {post.caption}
                </Text>

                {post.tags && post.tags.length > 0 && (
                    <View style={styles.postTagsWrapper}>
                        {post.tags.map(tagName => (
                            <Text key={tagName} style={[styles.postTagLabel, { color: colors.primary }]}>#{tagName}</Text>
                        ))}
                    </View>
                )}

                {commentsCount > 0 && (
                    <TouchableOpacity style={styles.viewCommentsBtn} onPress={handleCommentPress}>
                        <Text style={[styles.viewCommentsText, { color: colors.mutedForeground }]}>
                            View all {commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Share Bottom Sheet */}
            <ShareBottomSheet
                visible={showShareSheet}
                onClose={() => setShowShareSheet(false)}
                postImageUrl={post.postImage || post.imageUrl}
                postCaption={post.caption}
                postUserName={post.userName}
                postId={post.id || post._id}
            />
        </View>
    );
}


export const PostCard = React.memo(PostCardInner);

const styles = StyleSheet.create({
    cardSurface: {
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    cardHeaderArea: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    userInfoRow: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        minWidth: 0,
    },
    headerRightCluster: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        flexShrink: 0,
    },
    followPill: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 4,
        borderWidth: 1,
        minWidth: 78,
        alignItems: "center",
        justifyContent: "center",
    },
    followPillText: {
        fontSize: 12,
        fontWeight: "700",
    },
    profileAvatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    profileAvatarImg: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    avatarLabel: {
        color: "#fff",
        fontSize: 16,
        fontWeight: '700',
    },
    headerMetaData: {
        flex: 1,
        minWidth: 0,
        justifyContent: "center",
    },
    postAuthorName: {
        fontSize: 13,
        fontWeight: '700',
    },
    authorBadgeRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    roleIndicatorDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginRight: 4,
    },
    roleLabelText: {
        fontSize: 10,
        fontWeight: '600',
    },
    postTimestamp: {
        fontSize: 10,
        fontWeight: '400',
    },
    moreBtn: {
        padding: 4,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#f0f0f0',
    },
    postMediaImage: {
        width: '100%',
        height: '100%',
    },
    bigHeartContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    postEngagementActions: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    actionGroupLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    actionItemBtn: {
        alignItems: "center",
        justifyContent: "center",
    },
    likesCountText: {
        fontSize: 13,
        fontWeight: '700',
        paddingHorizontal: 12,
        marginBottom: 6,
    },
    captionSection: {
        paddingHorizontal: 12,
    },
    captionContent: {
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '400',
    },
    captionUser: {
        fontWeight: '700',
    },
    postTagsWrapper: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        marginTop: 6,
    },
    postTagLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    viewCommentsBtn: {
        marginTop: 8,
    },
    viewCommentsText: {
        fontSize: 13,
        fontWeight: '400',
    },
});
