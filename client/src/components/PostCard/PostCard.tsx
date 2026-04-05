import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image, Dimensions } from "react-native";
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

const { width } = Dimensions.get('window');

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
}

/**
 * Properties for the PostCard component.
 */
interface IPostCardProps {
    post: IPost;
    onLike: (id: string) => void;
}

/**
 * Component for rendering an Instagram-style community card.
 * Highlights visual content and follows modern social feed patterns.
 */
function PostCardInner({ post, onLike }: IPostCardProps) {
    const colors = useColors();
    const navigation = useNavigation<any>();
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

    const formattedRoleLabel = post.userRole === "freelancer" ? "Freelancer" : "Hiring Partner";
    const roleDisplayColor = post.userRole === "freelancer" ? colors.primary : colors.purpleAccent;
    const isLiked = post.likedByMe ?? post.isLiked ?? false;
    const rawLikes = post.likes as any;
    const likesCount = Array.isArray(rawLikes) ? rawLikes.length : (Number(rawLikes) || 0);
    const commentsCount = Array.isArray(post.comments) ? post.comments.length : (Number(post.comments) || 0);


    return (
        <View style={[styles.cardSurface, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Header: User Info */}
            <View style={styles.cardHeaderArea}>
                <View style={styles.userInfoRow}>
                    {post.userAvatar ? (
                        <Image source={{ uri: post.userAvatar }} style={styles.profileAvatarImg} />
                    ) : (
                        <View style={[styles.profileAvatarPlaceholder, { backgroundColor: colors.primary }]}>
                            <Text style={styles.avatarLabel}>{post.userName.charAt(0)}</Text>
                        </View>
                    )}
                    <View style={styles.headerMetaData}>
                        <Text style={[styles.postAuthorName, { color: colors.foreground }]}>{post.userName}</Text>
                        <View style={styles.authorBadgeRow}>
                            <View style={[styles.roleIndicatorDot, { backgroundColor: roleDisplayColor }]} />
                            <Text style={[styles.roleLabelText, { color: roleDisplayColor }]}>{formattedRoleLabel}</Text>
                            <Text style={[styles.postTimestamp, { color: colors.mutedForeground }]}> • {formatRelativeTime(post.createdAt)}</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity style={styles.moreBtn}>
                    <Feather name="more-horizontal" size={20} color={colors.mutedForeground} />
                </TouchableOpacity>
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

                    <TouchableOpacity style={styles.actionItemBtn} activeOpacity={0.7}>
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
                    <Text style={styles.captionUser}>{post.userName} </Text>
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
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
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
