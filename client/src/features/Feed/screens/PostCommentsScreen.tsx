import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated as RNAnimated,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { useApp, Comment, Reply } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { formatRelativeTime } from "@/utils/formatRelativeTime";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RouteParams {
    postId: string;
    postOwnerId: string;
    caption: string;
    userName: string;
    userAvatar?: string;
    likesCount: number;
}

interface ReplyingTo {
    commentId: string;
    userName: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(isoString: string) {
    return formatRelativeTime(isoString);
}

// ─── Reply Row ────────────────────────────────────────────────────────────────

interface ReplyRowProps {
    reply: Reply;
    postOwnerId: string;
    colors: ReturnType<typeof useColors>;
}

function ReplyRow({ reply, postOwnerId, colors }: ReplyRowProps) {
    const isOwner = reply.userId?.toString() === postOwnerId?.toString();
    return (
        <View style={replyStyles.container}>
            {reply.userAvatar ? (
                <Image source={{ uri: reply.userAvatar }} style={replyStyles.avatar} />
            ) : (
                <View style={[replyStyles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                    <Text style={replyStyles.avatarLetter}>{reply.userName?.charAt(0) ?? "?"}</Text>
                </View>
            )}
            <View style={replyStyles.bubble}>
                <View style={replyStyles.nameRow}>
                    <Text style={[replyStyles.name, { color: colors.foreground }]}>{reply.userName}</Text>
                    {isOwner && (
                        <View style={[replyStyles.authorBadge, { backgroundColor: colors.primary + '20', borderColor: colors.primary + '50' }]}>
                            <Text style={[replyStyles.authorBadgeText, { color: colors.primary }]}>Author</Text>
                        </View>
                    )}
                    <Text style={[replyStyles.time, { color: colors.mutedForeground }]}>{timeAgo(reply.createdAt)}</Text>
                </View>
                <Text style={[replyStyles.text, { color: colors.foreground }]}>{reply.text}</Text>
            </View>
        </View>
    );
}

const replyStyles = StyleSheet.create({
    container: { flexDirection: "row", gap: 10, marginTop: 10, paddingLeft: 20 },
    avatar: { width: 28, height: 28, borderRadius: 14, marginTop: 2 },
    avatarPlaceholder: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 2 },
    avatarLetter: { color: "#fff", fontSize: 11, fontWeight: "700" },
    bubble: { flex: 1 },
    nameRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 3 },
    name: { fontSize: 12, fontWeight: "700" },
    authorBadge: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
    authorBadgeText: { fontSize: 9, fontWeight: "700", letterSpacing: 0.3 },
    time: { fontSize: 11 },
    text: { fontSize: 13, lineHeight: 18 },
});

// ─── Comment Row ──────────────────────────────────────────────────────────────

interface CommentRowProps {
    comment: Comment;
    postOwnerId: string;
    colors: ReturnType<typeof useColors>;
    onReply: (commentId: string, userName: string) => void;
    currentUserId?: string;
}

function CommentRow({ comment, postOwnerId, colors, onReply, currentUserId }: CommentRowProps) {
    const [showReplies, setShowReplies] = useState(false);
    const [localReplies, setLocalReplies] = useState<Reply[]>(comment.replies ?? []);
    const isOwner = comment.userId?.toString() === postOwnerId?.toString();
    const fadeAnim = useRef(new RNAnimated.Value(0)).current;

    useEffect(() => {
        RNAnimated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    }, []);

    // Sync external reply additions
    useEffect(() => {
        setLocalReplies(comment.replies ?? []);
    }, [comment.replies]);

    return (
        <RNAnimated.View style={[commentStyles.container, { opacity: fadeAnim }]}>
            <View style={commentStyles.row}>
                {comment.userAvatar ? (
                    <Image source={{ uri: comment.userAvatar }} style={commentStyles.avatar} />
                ) : (
                    <View style={[commentStyles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                        <Text style={commentStyles.avatarLetter}>{comment.userName?.charAt(0) ?? "?"}</Text>
                    </View>
                )}

                <View style={commentStyles.contentArea}>
                    <View style={[commentStyles.bubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={commentStyles.nameRow}>
                            <Text style={[commentStyles.name, { color: colors.foreground }]}>{comment.userName}</Text>
                            {isOwner && (
                                <View style={[commentStyles.authorBadge, { backgroundColor: colors.primary + '20', borderColor: colors.primary + '55' }]}>
                                    <Text style={[commentStyles.authorBadgeText, { color: colors.primary }]}>Author</Text>
                                </View>
                            )}
                        </View>
                        <Text style={[commentStyles.text, { color: colors.foreground }]}>{comment.text}</Text>
                    </View>

                    {/* Action row */}
                    <View style={commentStyles.actionRow}>
                        <Text style={[commentStyles.time, { color: colors.mutedForeground }]}>{timeAgo(comment.createdAt)}</Text>
                        <TouchableOpacity onPress={() => onReply(comment._id, comment.userName)}>
                            <Text style={[commentStyles.replyBtn, { color: colors.primary }]}>Reply</Text>
                        </TouchableOpacity>
                        {localReplies.length > 0 && (
                            <TouchableOpacity onPress={() => setShowReplies(v => !v)} style={commentStyles.repliesToggle}>
                                <MaterialCommunityIcons
                                    name={showReplies ? "chevron-up" : "chevron-down"}
                                    size={14}
                                    color={colors.mutedForeground}
                                />
                                <Text style={[commentStyles.repliesCount, { color: colors.mutedForeground }]}>
                                    {localReplies.length} {localReplies.length === 1 ? "reply" : "replies"}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Replies thread */}
                    {showReplies && localReplies.map(reply => (
                        <ReplyRow
                            key={reply._id}
                            reply={reply}
                            postOwnerId={postOwnerId}
                            colors={colors}
                        />
                    ))}
                </View>
            </View>
        </RNAnimated.View>
    );
}

const commentStyles = StyleSheet.create({
    container: { paddingHorizontal: 16, marginBottom: 20 },
    row: { flexDirection: "row", gap: 10 },
    avatar: { width: 36, height: 36, borderRadius: 18, marginTop: 2 },
    avatarPlaceholder: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginTop: 2 },
    avatarLetter: { color: "#fff", fontSize: 14, fontWeight: "700" },
    contentArea: { flex: 1 },
    bubble: {
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    nameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
    name: { fontSize: 13, fontWeight: "700" },
    authorBadge: { borderWidth: 1, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
    authorBadgeText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.3 },
    text: { fontSize: 14, lineHeight: 20 },
    actionRow: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 6, paddingLeft: 4 },
    time: { fontSize: 11 },
    replyBtn: { fontSize: 12, fontWeight: "700" },
    repliesToggle: { flexDirection: "row", alignItems: "center", gap: 3 },
    repliesCount: { fontSize: 12 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PostCommentsScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const route = useRoute();
    const params = route.params as RouteParams;
    const { user, fetchComments, addComment, addReply } = useApp();

    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [inputText, setInputText] = useState("");
    const [replyingTo, setReplyingTo] = useState<ReplyingTo | null>(null);
    const inputRef = useRef<TextInput>(null);
    const listRef = useRef<FlatList>(null);

    const loadComments = useCallback(async () => {
        try {
            const { comments: fetched } = await fetchComments(params.postId);
            setComments(fetched ?? []);
        } catch {
            setComments([]);
        } finally {
            setLoading(false);
        }
    }, [params.postId]);

    useEffect(() => { loadComments(); }, [loadComments]);

    const handleReply = (commentId: string, userName: string) => {
        setReplyingTo({ commentId, userName });
        setInputText(`@${userName} `);
        inputRef.current?.focus();
    };

    const cancelReply = () => {
        setReplyingTo(null);
        setInputText("");
    };

    const handleSend = async () => {
        const text = inputText.trim();
        if (!text || sending) return;
        setSending(true);
        try {
            if (replyingTo) {
                const newReply = await addReply(params.postId, replyingTo.commentId, text);
                setComments(prev => prev.map(c =>
                    c._id === replyingTo.commentId
                        ? { ...c, replies: [...(c.replies ?? []), newReply] }
                        : c
                ));
                setReplyingTo(null);
            } else {
                const newComment = await addComment(params.postId, text);
                setComments(prev => [...prev, newComment]);
                setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 150);
            }
            setInputText("");
        } catch (err) {
            console.error("Send error:", err);
        } finally {
            setSending(false);
        }
    };

    const renderItem = useCallback(({ item }: { item: Comment }) => (
        <CommentRow
            comment={item}
            postOwnerId={params.postOwnerId}
            colors={colors}
            onReply={handleReply}
            currentUserId={user?._id}
        />
    ), [params.postOwnerId, colors, user?._id]);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <KeyboardAvoidingView
            style={[styles.root, { backgroundColor: colors.background }]}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={0}
        >
            {/* ── Header ── */}
            <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border, paddingTop: insets.top + 8 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <Ionicons name="close" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.foreground }]}>Comments</Text>
                <View style={{ width: 36 }} />
            </View>

            {/* ── Post mini preview ── */}
            <View style={[styles.postPreview, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {params.userAvatar ? (
                    <Image source={{ uri: params.userAvatar }} style={styles.previewAvatar} />
                ) : (
                    <View style={[styles.previewAvatarPlaceholder, { backgroundColor: colors.primary }]}>
                        <Text style={styles.previewAvatarText}>{params.userName?.charAt(0) ?? "?"}</Text>
                    </View>
                )}
                <View style={styles.previewMeta}>
                    <Text style={[styles.previewUserName, { color: colors.foreground }]}>{params.userName}</Text>
                    <Text style={[styles.previewCaption, { color: colors.mutedForeground }]} numberOfLines={2}>
                        {params.caption}
                    </Text>
                </View>
                <View style={styles.previewLikes}>
                    <Ionicons name="heart" size={14} color={colors.destructive} />
                    <Text style={[styles.previewLikesCount, { color: colors.mutedForeground }]}>{params.likesCount}</Text>
                </View>
            </View>

            {/* ── Section header ── */}
            <View style={[styles.sectionHeader, { borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                    {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
                </Text>
            </View>

            {/* ── Comment list ── */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color={colors.primary} size="large" />
                    <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading comments…</Text>
                </View>
            ) : (
                <FlatList
                    ref={listRef}
                    data={comments}
                    keyExtractor={item => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={[styles.listContent, { paddingBottom: replyingTo ? 160 : 120 }]}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="comment-outline" size={52} color={colors.mutedForeground} />
                            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No comments yet</Text>
                            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Be the first to share your thoughts!</Text>
                        </View>
                    )}
                />
            )}

            {/* ── Replying-to chip ── */}
            {replyingTo && (
                <View style={[styles.replyChip, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '40' }]}>
                    <Feather name="corner-down-right" size={14} color={colors.primary} />
                    <Text style={[styles.replyChipText, { color: colors.primary }]}>
                        Replying to <Text style={{ fontWeight: "700" }}>@{replyingTo.userName}</Text>
                    </Text>
                    <TouchableOpacity onPress={cancelReply} style={styles.replyChipClose}>
                        <Ionicons name="close-circle" size={18} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            )}

            {/* ── Input Bar ── */}
            <View style={[
                styles.inputBar,
                {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    paddingBottom: insets.bottom + 8,
                }
            ]}>
                {user?.avatar ? (
                    <Image source={{ uri: user.avatar }} style={styles.inputAvatar} />
                ) : (
                    <View style={[styles.inputAvatarPlaceholder, { backgroundColor: colors.primary }]}>
                        <Text style={styles.inputAvatarText}>{user?.name?.charAt(0) ?? "?"}</Text>
                    </View>
                )}

                <TextInput
                    ref={inputRef}
                    style={[
                        styles.textInput,
                        {
                            color: colors.foreground,
                            backgroundColor: colors.background,
                            borderColor: colors.border,
                        }
                    ]}
                    placeholder={replyingTo ? `Reply to @${replyingTo.userName}…` : "Add a comment…"}
                    placeholderTextColor={colors.mutedForeground}
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                    maxLength={500}
                    returnKeyType="send"
                    onSubmitEditing={handleSend}
                />

                <TouchableOpacity
                    style={[
                        styles.sendBtn,
                        {
                            backgroundColor: inputText.trim() ? colors.primary : colors.border,
                            opacity: inputText.trim() ? 1 : 0.6,
                        }
                    ]}
                    onPress={handleSend}
                    disabled={!inputText.trim() || sending}
                    activeOpacity={0.8}
                >
                    {sending ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Ionicons name="send" size={16} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: { flex: 1 },

    // Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 14,
        borderBottomWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
    },
    closeBtn: { padding: 4 },
    headerTitle: { fontSize: 16, fontWeight: "700", letterSpacing: -0.3 },

    // Post preview
    postPreview: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        padding: 14,
        borderBottomWidth: 1,
        marginBottom: 4,
    },
    previewAvatar: { width: 38, height: 38, borderRadius: 19 },
    previewAvatarPlaceholder: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    previewAvatarText: { color: "#fff", fontWeight: "700", fontSize: 15 },
    previewMeta: { flex: 1 },
    previewUserName: { fontSize: 13, fontWeight: "700", marginBottom: 3 },
    previewCaption: { fontSize: 13, lineHeight: 18 },
    previewLikes: { flexDirection: "row", alignItems: "center", gap: 4 },
    previewLikesCount: { fontSize: 12, fontWeight: "600" },

    // Section header
    sectionHeader: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    sectionTitle: { fontSize: 13, fontWeight: "700", letterSpacing: 0.2 },

    // List
    listContent: { paddingTop: 16 },

    // Loading / Empty
    loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingTop: 60 },
    loadingText: { fontSize: 14 },
    emptyState: { alignItems: "center", paddingTop: 60, gap: 10, paddingHorizontal: 32 },
    emptyTitle: { fontSize: 18, fontWeight: "700" },
    emptySub: { fontSize: 14, textAlign: "center", lineHeight: 20 },

    // Reply chip
    replyChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderTopWidth: 1,
    },
    replyChipText: { flex: 1, fontSize: 13 },
    replyChipClose: { padding: 2 },

    // Input bar
    inputBar: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 10,
        paddingTop: 10,
        paddingHorizontal: 14,
        borderTopWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 10,
    },
    inputAvatar: { width: 34, height: 34, borderRadius: 17, marginBottom: 6 },
    inputAvatarPlaceholder: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", marginBottom: 6 },
    inputAvatarText: { color: "#fff", fontWeight: "700", fontSize: 13 },
    textInput: {
        flex: 1,
        borderRadius: 22,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 10,
        fontSize: 14,
        lineHeight: 20,
        maxHeight: 120,
        minHeight: 42,
    },
    sendBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
    },
});
