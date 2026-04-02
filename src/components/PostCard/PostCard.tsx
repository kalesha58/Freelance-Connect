import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image, Dimensions } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { useColors } from "@/hooks/useColors";
import { UserRole } from "@/types/auth";

const { width } = Dimensions.get('window');

/**
 * Interface representing content shared by users in the activity feed.
 */
export interface IPost {
    id: string;
    userName: string;
    userRole: UserRole;
    userAvatar?: string;
    caption: string;
    postImage?: string;
    likes: number;
    comments: number;
    isLiked: boolean;
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
    const iconScaleValue = useSharedValue(1);

    const heartAnimationStyle = useAnimatedStyle(() => ({
        transform: [{ scale: iconScaleValue.value }],
    }));

    const handleLikeInteraction = () => {
        iconScaleValue.value = withSpring(1.4, {}, () => {
            iconScaleValue.value = withSpring(1);
        });
        onLike(post.id);
    };

    const formattedRoleLabel = post.userRole === "freelancer" ? "Freelancer" : "Hiring Partner";
    const roleDisplayColor = post.userRole === "freelancer" ? colors.primary : colors.purpleAccent;

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
                            <Text style={[styles.postTimestamp, { color: colors.mutedForeground }]}> • {post.createdAt}</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity style={styles.moreBtn}>
                    <Feather name="more-horizontal" size={20} color={colors.mutedForeground} />
                </TouchableOpacity>
            </View>

            {/* Post Content: Image (Instagram Style) */}
            {post.postImage && (
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: post.postImage }}
                        style={styles.postMediaImage}
                        resizeMode="cover"
                    />
                </View>
            )}

            {/* Engagement Bar */}
            <View style={styles.postEngagementActions}>
                <View style={styles.actionGroupLeft}>
                    <TouchableOpacity style={styles.actionItemBtn} onPress={handleLikeInteraction} activeOpacity={0.7}>
                        <Animated.View style={heartAnimationStyle}>
                            <Ionicons
                                name={post.isLiked ? "heart" : "heart-outline"}
                                size={26}
                                color={post.isLiked ? colors.destructive : colors.foreground}
                            />
                        </Animated.View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionItemBtn} activeOpacity={0.7}>
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
                {post.likes.toLocaleString()} likes
            </Text>

            {/* Caption Section */}
            <View style={styles.captionSection}>
                <Text style={[styles.captionContent, { color: colors.foreground }]}>
                    <Text style={styles.captionUser}>{post.userName} </Text>
                    {post.caption}
                </Text>

                {post.tags.length > 0 && (
                    <View style={styles.postTagsWrapper}>
                        {post.tags.map(tagName => (
                            <Text key={tagName} style={[styles.postTagLabel, { color: colors.primary }]}>#{tagName}</Text>
                        ))}
                    </View>
                )}

                {post.comments > 0 && (
                    <TouchableOpacity style={styles.viewCommentsBtn}>
                        <Text style={[styles.viewCommentsText, { color: colors.mutedForeground }]}>
                            View all {post.comments} comments
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
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    profileAvatarImg: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    avatarLabel: {
        color: "#fff",
        fontSize: 14,
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
        aspectRatio: 1, // Instagram standard square or 4:5
        backgroundColor: '#f0f0f0',
    },
    postMediaImage: {
        width: '100%',
        height: '100%',
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
