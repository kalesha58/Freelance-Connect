import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Clipboard,
    Dimensions,
    FlatList,
    Image,
    Modal,
    PanResponder,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.65;

interface IShareBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    postImageUrl?: string;
    postCaption?: string;
    postUserName?: string;
    postId?: string;
}

/**
 * ShareBottomSheet provides an Instagram-style share experience.
 * Can share with friends, set post image as status, copy link, or use the system share dialog.
 */
export function ShareBottomSheet({
    visible,
    onClose,
    postImageUrl,
    postCaption,
    postUserName,
    postId,
}: IShareBottomSheetProps) {
    const colors = useColors();
    const navigation = useNavigation<any>();
    const { user, statuses } = useApp();
    const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
    const [setAsStatusLoading, setSetAsStatusLoading] = useState(false);
    const [sentTo, setSentTo] = useState<string[]>([]);
    const [statusDone, setStatusDone] = useState(false);

    // Build uniquely filtered "friends" list from active statuses
    // We normalize the ID to string to prevent duplicates from mixed types
    const contacts = useMemo(() => {
        const map = new Map();
        statuses.forEach(s => {
            if (!s.userId || s.userId.toString() === user?._id?.toString()) return;
            const uid = s.userId.toString();
            if (!map.has(uid)) {
                map.set(uid, { id: uid, name: s.userName, avatar: s.userAvatar });
            }
        });
        return Array.from(map.values());
    }, [statuses, user?._id]);


    useEffect(() => {
        if (visible) {
            setStatusDone(false);
            setSentTo([]);
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                damping: 20,
                stiffness: 200,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: SHEET_HEIGHT,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const close = useCallback(() => {
        Animated.timing(slideAnim, {
            toValue: SHEET_HEIGHT,
            duration: 250,
            useNativeDriver: true,
        }).start(() => onClose());
    }, [onClose]);

    const handleSendToFriend = (friendId: string) => {
        setSentTo(prev => [...prev, friendId]);
    };

    const handleSetAsStatus = () => {
        if (!postImageUrl) {
            Alert.alert("No Image", "This post doesn't have an image to set as status.");
            return;
        }
        
        // Close the bottom sheet first
        close();
        
        // Navigate to the markup/caption screen
        // We use setTimeout to ensure the sheet is closed and modal unmounted before navigation
        setTimeout(() => {
            navigation.navigate('CreateStatus', { imageUri: postImageUrl });
        }, 300);
    };

    const handleCopyLink = () => {
        const link = `skilllink://post/${postId}`;
        Clipboard.setString(link);
        Alert.alert("Copied!", "Post link copied to clipboard.");
    };

    const handleNativeShare = async () => {
        try {
            await Share.share({
                message: `Check out this post by ${postUserName} on Skill Link!\n\n"${postCaption}"\n\nskilllink://post/${postId}`,
                title: `${postUserName}'s Post`,
            });
        } catch (e) {
            console.warn("Share error:", e);
        }
    };

    const PanGestureHandler = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, { dy }) => dy > 5,
        onPanResponderMove: (_, { dy }) => {
            if (dy > 0) slideAnim.setValue(dy);
        },
        onPanResponderRelease: (_, { dy, vy }) => {
            if (dy > 100 || vy > 0.5) {
                close();
            } else {
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    damping: 20,
                    stiffness: 200,
                }).start();
            }
        },
    });

    const options = [
        {
            id: "status",
            icon: statusDone ? "check-circle" : "clock",
            iconLib: "feather",
            label: statusDone ? "Added to Status!" : (setAsStatusLoading ? "Setting..." : "Set as Status"),
            color: statusDone ? colors.success : colors.primary,
            onPress: handleSetAsStatus,
        },
        {
            id: "copy",
            icon: "link-2",
            iconLib: "feather",
            label: "Copy Link",
            color: colors.purpleAccent,
            onPress: handleCopyLink,
        },
        {
            id: "share",
            icon: "share-social-outline",
            iconLib: "ion",
            label: "Share via...",
            color: colors.warning,
            onPress: handleNativeShare,
        },
    ];

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={close}>
            <TouchableWithoutFeedback onPress={close}>
                <View style={styles.backdrop} />
            </TouchableWithoutFeedback>

            <Animated.View
                style={[
                    styles.sheet,
                    { backgroundColor: colors.card, transform: [{ translateY: slideAnim }] },
                ]}
            >
                {/* Drag Handle */}
                <View {...PanGestureHandler.panHandlers} style={styles.handleArea}>
                    <View style={[styles.handle, { backgroundColor: colors.border }]} />
                </View>

                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    {postImageUrl && (
                        <Image source={{ uri: postImageUrl }} style={styles.postThumb} />
                    )}
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Share Post</Text>
                        {postUserName && (
                            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
                                by {postUserName}
                            </Text>
                        )}
                    </View>
                    <TouchableOpacity onPress={close} style={styles.closeBtn}>
                        <Feather name="x" size={20} color={colors.mutedForeground} />
                    </TouchableOpacity>
                </View>

                {/* Friends Row */}
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Send to</Text>
                {contacts.length > 0 ? (
                    <FlatList
                        data={contacts}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={c => c.id}
                        contentContainerStyle={styles.contactsRow}
                        renderItem={({ item }) => {
                            const isSent = sentTo.includes(item.id);
                            return (
                                <TouchableOpacity
                                    style={styles.contactItem}
                                    onPress={() => handleSendToFriend(item.id)}
                                    activeOpacity={0.8}
                                >
                                    <View
                                        style={[
                                            styles.contactAvatarBorder,
                                            { borderColor: isSent ? colors.success : colors.border },
                                        ]}
                                    >
                                        {item.avatar ? (
                                            <Image source={{ uri: item.avatar }} style={styles.contactAvatar} />
                                        ) : (
                                            <View style={[styles.contactAvatarFallback, { backgroundColor: colors.primary }]}>
                                                <Text style={styles.contactInitial}>{item.name.charAt(0)}</Text>
                                            </View>
                                        )}
                                        {isSent && (
                                            <View style={[styles.sentBadge, { backgroundColor: colors.success }]}>
                                                <Feather name="check" size={8} color="#fff" />
                                            </View>
                                        )}
                                    </View>
                                    <Text style={[styles.contactName, { color: colors.foreground }]} numberOfLines={1}>
                                        {isSent ? "Sent ✓" : item.name.split(" ")[0]}
                                    </Text>
                                </TouchableOpacity>
                            );
                        }}
                    />
                ) : (
                    <View style={styles.noFriendsRow}>
                        <Feather name="users" size={20} color={colors.mutedForeground} />
                        <Text style={[styles.noFriendsText, { color: colors.mutedForeground }]}>
                            No active contacts right now
                        </Text>
                    </View>
                )}

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* Options */}
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>More options</Text>
                <View style={styles.optionsGrid}>
                    {options.map(opt => (
                        <TouchableOpacity
                            key={opt.id}
                            style={[styles.optionBtn, { backgroundColor: opt.color + "15", borderColor: opt.color + "30" }]}
                            onPress={opt.onPress}
                            activeOpacity={0.75}
                        >
                            <View style={[styles.optionIconCircle, { backgroundColor: opt.color + "20" }]}>
                                {opt.iconLib === "ion" ? (
                                    <Ionicons name={opt.icon as any} size={20} color={opt.color} />
                                ) : (
                                    <Feather name={opt.icon as any} size={20} color={opt.color} />
                                )}
                            </View>
                            <Text style={[styles.optionLabel, { color: opt.color }]}>{opt.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    sheet: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: SHEET_HEIGHT,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: "hidden",
    },
    handleArea: { paddingTop: 12, paddingBottom: 6, alignItems: "center" },
    handle: { width: 40, height: 4, borderRadius: 2 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 16,
        gap: 14,
        borderBottomWidth: 1,
        marginBottom: 4,
    },
    postThumb: { width: 44, height: 44, borderRadius: 10, backgroundColor: "#eee" },
    headerTitle: { fontSize: 16, fontWeight: "700" },
    headerSub: { fontSize: 12, fontWeight: "400", marginTop: 2 },
    closeBtn: { padding: 6 },
    sectionTitle: { fontSize: 13, fontWeight: "700", paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8, textTransform: "uppercase", letterSpacing: 0.4 },
    contactsRow: { paddingHorizontal: 16, gap: 12, paddingBottom: 4 },
    contactItem: { alignItems: "center", width: 68 },
    contactAvatarBorder: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, padding: 2, marginBottom: 6, position: "relative" },
    contactAvatar: { width: "100%", height: "100%", borderRadius: 26 },
    contactAvatarFallback: { width: "100%", height: "100%", borderRadius: 26, alignItems: "center", justifyContent: "center" },
    contactInitial: { color: "#fff", fontSize: 20, fontWeight: "700" },
    sentBadge: { position: "absolute", bottom: -2, right: -2, width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "#fff" },
    contactName: { fontSize: 11, fontWeight: "500", textAlign: "center" },
    noFriendsRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 14 },
    noFriendsText: { fontSize: 13, fontWeight: "400" },
    divider: { height: 1, marginHorizontal: 20, marginTop: 8 },
    optionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 20, paddingTop: 4, paddingBottom: 20 },
    optionBtn: { flex: 1, minWidth: "28%", borderRadius: 16, borderWidth: 1, padding: 16, alignItems: "center", gap: 10 },
    optionIconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
    optionLabel: { fontSize: 12, fontWeight: "600", textAlign: "center" },
});
