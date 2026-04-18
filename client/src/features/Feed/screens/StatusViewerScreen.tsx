import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    PanResponder,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import { RootStackParamList, IStatus, IStatusViewer } from "@/navigation/types";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const { width, height } = Dimensions.get("window");
const STORY_DURATION_MS = 5000;
const VIEWERS_SHEET_HEIGHT = height * 0.60;

type StatusViewerRouteProp = RouteProp<RootStackParamList, "StatusViewer">;

/**
 * StatusViewerScreen — immersive full-screen status viewer.
 *
 * Features:
 * - Auto-advancing progress bars (5s each), tap left/right to navigate.
 * - Long-press to pause — resumes from exact progress position.
 * - "X/Y" counter when a user has multiple statuses.
 * - **Swipe-up viewers panel** (only visible to status owner): shows a list of
 *   who has viewed the current status, sorted newest-first.
 */
export default function StatusViewerScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const route = useRoute<StatusViewerRouteProp>();
    const colors = useColors();
    const { statuses: routeStatuses, initialIndex } = route.params ?? {};
    const { user, markStatusViewed, statuses: liveStatuses } = useApp();

    // ── Guard ────────────────────────────────────────────────────────────────

    const safeStatuses: IStatus[] = Array.isArray(routeStatuses) && routeStatuses.length > 0
        ? routeStatuses : [];

    const safeInitialIndex = Math.min(
        Math.max(0, initialIndex ?? 0),
        Math.max(0, safeStatuses.length - 1)
    );

    // ── State ────────────────────────────────────────────────────────────────

    const [currentIndex, setCurrentIndex] = useState(safeInitialIndex);
    const [isPaused, setIsPaused] = useState(false);
    const [showViewers, setShowViewers] = useState(false);

    const progressAnim = useRef(new Animated.Value(0)).current;
    const progressAnimRef = useRef<Animated.CompositeAnimation | null>(null);
    const pausedProgressValue = useRef(0);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const viewersSheetAnim = useRef(new Animated.Value(VIEWERS_SHEET_HEIGHT)).current;

    // ── Derived values ───────────────────────────────────────────────────────

    const currentStatus: IStatus | undefined = safeStatuses[currentIndex];

    /** Always read live viewer list from context so it updates in real-time */
    const liveCurrentStatus = liveStatuses.find(s => s.id === currentStatus?.id);
    const viewers: IStatusViewer[] = liveCurrentStatus?.viewers ?? currentStatus?.viewers ?? [];

    /** Only the status owner can see who viewed their story */
    const isMyStatus = !!user && currentStatus?.userId === user._id;

    // ── Progress animation ───────────────────────────────────────────────────

    const startProgress = useCallback((fromValue = 0) => {
        progressAnim.setValue(fromValue);
        progressAnimRef.current?.stop();
        const remainingMs = STORY_DURATION_MS * (1 - fromValue);
        progressAnimRef.current = Animated.timing(progressAnim, {
            toValue: 1,
            duration: remainingMs,
            useNativeDriver: false,
        });
        progressAnimRef.current.start(({ finished }) => {
            if (finished) goToNext();
        });
    }, [currentIndex]);

    // Track progress so we can resume from the exact pause position
    useEffect(() => {
        const id = progressAnim.addListener(({ value }) => {
            pausedProgressValue.current = value;
        });
        return () => progressAnim.removeListener(id);
    }, []);

    useEffect(() => {
        if (!currentStatus) { navigation.goBack(); return; }

        // Record the viewer (pass current user's info only if it's someone else's status)
        if (!isMyStatus && user) {
            markStatusViewed(currentStatus.id, {
                userId: user._id,
                userName: user.name,
                userAvatar: user.avatar || user.profilePic,
            });
        } else {
            // Mark as seen from owner's perspective without adding a viewer record
            markStatusViewed(currentStatus.id);
        }

        startProgress(0);
        return () => { progressAnimRef.current?.stop(); };
    }, [currentIndex]);

    // ── Navigation ───────────────────────────────────────────────────────────

    const goToNext = useCallback(() => {
        if (currentIndex < safeStatuses.length - 1) {
            setCurrentIndex(i => i + 1);
        } else {
            navigation.goBack();
        }
    }, [currentIndex, safeStatuses.length]);

    const goToPrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(i => i - 1);
        } else {
            startProgress(0); // restart current
        }
    }, [currentIndex]);

    // ── Long-press (pause / resume) ──────────────────────────────────────────

    const handleLongPressIn = () => {
        longPressTimer.current = setTimeout(() => {
            progressAnimRef.current?.stop();
            setIsPaused(true);
        }, 150);
    };

    const handleLongPressOut = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
        if (isPaused) {
            setIsPaused(false);
            startProgress(pausedProgressValue.current);
        }
    };

    // ── Viewers panel ────────────────────────────────────────────────────────

    /** Swipe-up PanResponder: only activates on clear upward swipes so taps still work */
    const swipeUpPanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_, { dy, dx }) =>
                !showViewers && dy < -20 && Math.abs(dy) > Math.abs(dx) * 1.5,
            onPanResponderRelease: (_, { dy, vy }) => {
                if (dy < -60 || vy < -0.5) openViewers();
            },
        })
    ).current;

    const openViewers = () => {
        progressAnimRef.current?.stop(); // pause story while sheet is open
        setShowViewers(true);
        Animated.spring(viewersSheetAnim, {
            toValue: 0,
            damping: 22,
            stiffness: 200,
            useNativeDriver: true,
        }).start();
    };

    const closeViewers = () => {
        Animated.timing(viewersSheetAnim, {
            toValue: VIEWERS_SHEET_HEIGHT,
            duration: 260,
            useNativeDriver: true,
        }).start(() => {
            setShowViewers(false);
            // Resume from where we paused
            startProgress(pausedProgressValue.current);
        });
    };

    // ── Helpers ──────────────────────────────────────────────────────────────

    const formatTimeAgo = (ts: number) => {
        const diffMs = Date.now() - ts;
        const mins = Math.floor(diffMs / 60000);
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    // ── Empty guard ──────────────────────────────────────────────────────────

    if (!safeStatuses.length || !currentStatus) return null;

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <View style={styles.root} {...swipeUpPanResponder.panHandlers}>
            <StatusBar hidden />

            {/* Full-screen story image */}
            <Image
                key={currentStatus.id}
                source={{ uri: currentStatus.imageUri }}
                style={styles.storyImage}
                resizeMode="cover"
            />

            {/* Top scrim for readability */}
            <View style={styles.topScrim} />

            {/* Bottom scrim for views bar readability */}
            {isMyStatus && <View style={styles.bottomScrim} />}

            {/* ── Progress bars ────────────────────────────────────────────── */}
            <View style={[styles.progressBarRow, { paddingTop: insets.top + 6 }]}>
                {safeStatuses.map((_, idx) => {
                    const fillWidth =
                        idx < currentIndex
                            ? "100%"
                            : idx === currentIndex
                            ? progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] })
                            : "0%";
                    return (
                        <View key={idx} style={styles.progressBarBg}>
                            <Animated.View style={[styles.progressBarFill, { width: fillWidth as any }]} />
                        </View>
                    );
                })}
            </View>

            {/* ── User info header ─────────────────────────────────────────── */}
            <View style={[styles.userInfoHeader, { top: insets.top + 22 }]}>
                <View style={styles.avatarNameRow}>
                    {currentStatus.userAvatar ? (
                        <Image source={{ uri: currentStatus.userAvatar }} style={styles.avatarImg} />
                    ) : (
                        <View style={styles.avatarFallback}>
                            <Text style={styles.avatarInitial}>
                                {currentStatus.userName.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}
                    <View>
                        <Text style={styles.storyUserName}>{currentStatus.userName}</Text>
                        <View style={styles.metaRow}>
                            <Text style={styles.storyTime}>{formatTimeAgo(currentStatus.createdAt)}</Text>
                            {safeStatuses.length > 1 && (
                                <Text style={styles.storyCount}>
                                    {" · "}{currentIndex + 1}/{safeStatuses.length}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.closeBtn}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <Feather name="x" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* ── Tap zones for prev/next ───────────────────────────────────── */}
            <View style={styles.tapZoneContainer}>
                <TouchableWithoutFeedback
                    onPress={goToPrev}
                    onLongPress={handleLongPressIn}
                    onPressOut={handleLongPressOut}
                    delayLongPress={150}
                >
                    <View style={styles.tapLeft} />
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback
                    onPress={goToNext}
                    onLongPress={handleLongPressIn}
                    onPressOut={handleLongPressOut}
                    delayLongPress={150}
                >
                    <View style={styles.tapRight} />
                </TouchableWithoutFeedback>
            </View>

            {/* ── Paused indicator ─────────────────────────────────────────── */}
            {isPaused && (
                <View style={styles.pausedOverlay} pointerEvents="none">
                    <View style={styles.pausedIconBg}>
                        <Feather name="pause" size={28} color="#fff" />
                    </View>
                </View>
            )}

            {/* ── View count bar (owner only) ───────────────────────────────── */}
            {isMyStatus && (
                <TouchableOpacity
                    style={[styles.viewCountBar, { paddingBottom: insets.bottom + 16 }]}
                    onPress={openViewers}
                    activeOpacity={0.85}
                    // zIndex above tap zones
                >
                    <Ionicons name="eye-outline" size={18} color="rgba(255,255,255,0.95)" />
                    <Text style={styles.viewCountText}>
                        {viewers.length} {viewers.length === 1 ? "view" : "views"}
                    </Text>
                    <Feather name="chevron-up" size={14} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.swipeUpHint}>Swipe up to see</Text>
                </TouchableOpacity>
            )}

            {/* ── Viewers bottom sheet ──────────────────────────────────────── */}
            <Modal
                visible={showViewers}
                transparent
                animationType="none"
                statusBarTranslucent
                onRequestClose={closeViewers}
            >
                {/* Backdrop: tap to close */}
                <TouchableWithoutFeedback onPress={closeViewers}>
                    <View style={styles.viewersBackdrop} />
                </TouchableWithoutFeedback>

                {/* Sliding sheet */}
                <Animated.View
                    style={[
                        styles.viewersSheet,
                        {
                            backgroundColor: colors.card,
                            transform: [{ translateY: viewersSheetAnim }],
                            paddingBottom: insets.bottom + 12,
                        },
                    ]}
                >
                    {/* Drag handle */}
                    <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />

                    {/* Sheet header */}
                    <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
                        <View style={styles.sheetTitleRow}>
                            <View style={[styles.sheetIconBg, { backgroundColor: colors.primary + "18" }]}>
                                <Ionicons name="eye-outline" size={20} color={colors.primary} />
                            </View>
                            <View>
                                <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
                                    {viewers.length} {viewers.length === 1 ? "View" : "Views"}
                                </Text>
                                <Text style={[styles.sheetSubtitle, { color: colors.mutedForeground }]}>
                                    People who viewed this status
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={closeViewers} style={styles.sheetCloseBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Feather name="x" size={20} color={colors.mutedForeground} />
                        </TouchableOpacity>
                    </View>

                    {/* Viewers list or empty state */}
                    {viewers.length === 0 ? (
                        <View style={styles.noViewersContainer}>
                            <View style={[styles.noViewersIconBg, { backgroundColor: colors.muted }]}>
                                <Ionicons name="eye-off-outline" size={38} color={colors.mutedForeground} />
                            </View>
                            <Text style={[styles.noViewersTitle, { color: colors.foreground }]}>
                                No views yet
                            </Text>
                            <Text style={[styles.noViewersSub, { color: colors.mutedForeground }]}>
                                When someone views your status, they'll appear here.
                            </Text>
                        </View>
                    ) : (
                        <ScrollView
                            style={styles.viewersList}
                            contentContainerStyle={styles.viewersListContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {viewers.map((v) => (
                                <View
                                    key={`${v.userId}_${v.viewedAt}`}
                                    style={[styles.viewerItem, { borderBottomColor: colors.border + "60" }]}
                                >
                                    {/* Avatar */}
                                    {v.userAvatar ? (
                                        <Image source={{ uri: v.userAvatar }} style={styles.viewerAvatar} />
                                    ) : (
                                        <View style={[styles.viewerAvatarFallback, { backgroundColor: colors.primary }]}>
                                            <Text style={styles.viewerAvatarInitial}>
                                                {v.userName.charAt(0).toUpperCase()}
                                            </Text>
                                        </View>
                                    )}

                                    {/* Name + time */}
                                    <View style={styles.viewerInfo}>
                                        <Text style={[styles.viewerName, { color: colors.foreground }]}>
                                            {v.userName}
                                        </Text>
                                        <Text style={[styles.viewerTime, { color: colors.mutedForeground }]}>
                                            {formatTimeAgo(v.viewedAt)}
                                        </Text>
                                    </View>

                                    {/* Eye icon */}
                                    <Ionicons name="eye" size={16} color={colors.primary} />
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </Animated.View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#000" },
    storyImage: { ...StyleSheet.absoluteFillObject, width, height },
    topScrim: {
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: 160,
        backgroundColor: "rgba(0,0,0,0.35)",
    },
    bottomScrim: {
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: 100,
        backgroundColor: "rgba(0,0,0,0.30)",
    },

    // ── Progress bars ──────────────────────────────────────────────────────
    progressBarRow: {
        position: "absolute",
        top: 0, left: 10, right: 10,
        flexDirection: "row",
        gap: 3,
        zIndex: 20,
    },
    progressBarBg: {
        flex: 1,
        height: 2.5,
        borderRadius: 2,
        backgroundColor: "rgba(255,255,255,0.35)",
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        backgroundColor: "#fff",
        borderRadius: 2,
    },

    // ── User info header ───────────────────────────────────────────────────
    userInfoHeader: {
        position: "absolute",
        left: 0, right: 0,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 14,
        zIndex: 20,
    },
    avatarNameRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    avatarImg: {
        width: 38, height: 38, borderRadius: 19,
        borderWidth: 2, borderColor: "#fff",
    },
    avatarFallback: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: "#1E63A9",
        alignItems: "center", justifyContent: "center",
        borderWidth: 2, borderColor: "#fff",
    },
    avatarInitial: { color: "#fff", fontSize: 16, fontWeight: "700" },
    storyUserName: {
        color: "#fff", fontSize: 14, fontWeight: "700",
        textShadowColor: "rgba(0,0,0,0.6)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    metaRow: { flexDirection: "row", alignItems: "center", marginTop: 1 },
    storyTime: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: "400" },
    storyCount: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "500" },
    closeBtn: { padding: 6 },

    // ── Tap zones ───────────────────────────────────────────────────────────
    tapZoneContainer: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: "row",
        zIndex: 10,
        marginTop: 110,
        marginBottom: 90, // leave space for view count bar
    },
    tapLeft: { flex: 1 },
    tapRight: { flex: 1 },

    // ── Paused overlay ──────────────────────────────────────────────────────
    pausedOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: "center", justifyContent: "center",
        zIndex: 30,
        backgroundColor: "rgba(0,0,0,0.25)",
    },
    pausedIconBg: {
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: "rgba(0,0,0,0.55)",
        alignItems: "center", justifyContent: "center",
    },

    // ── View count bar ──────────────────────────────────────────────────────
    viewCountBar: {
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingTop: 16,
        zIndex: 40,
    },
    viewCountText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "700",
        textShadowColor: "rgba(0,0,0,0.5)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    swipeUpHint: {
        color: "rgba(255,255,255,0.65)",
        fontSize: 11,
        fontWeight: "400",
    },

    // ── Viewers bottom sheet ────────────────────────────────────────────────
    viewersBackdrop: {
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    viewersSheet: {
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: VIEWERS_SHEET_HEIGHT,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: "hidden",
    },
    sheetHandle: {
        width: 40, height: 4, borderRadius: 2,
        alignSelf: "center",
        marginTop: 12, marginBottom: 6,
    },
    sheetHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    sheetTitleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    sheetIconBg: {
        width: 40, height: 40, borderRadius: 12,
        alignItems: "center", justifyContent: "center",
    },
    sheetTitle: { fontSize: 17, fontWeight: "700" },
    sheetSubtitle: { fontSize: 12, fontWeight: "400", marginTop: 1 },
    sheetCloseBtn: { padding: 4 },

    // ── No viewers empty state ──────────────────────────────────────────────
    noViewersContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        gap: 12,
    },
    noViewersIconBg: {
        width: 80, height: 80, borderRadius: 40,
        alignItems: "center", justifyContent: "center",
        marginBottom: 8,
    },
    noViewersTitle: { fontSize: 18, fontWeight: "700" },
    noViewersSub: {
        fontSize: 14, fontWeight: "400",
        textAlign: "center", lineHeight: 20,
    },

    // ── Viewers list ────────────────────────────────────────────────────────
    viewersList: { flex: 1 },
    viewersListContent: { paddingTop: 8 },
    viewerItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    viewerAvatar: { width: 46, height: 46, borderRadius: 23 },
    viewerAvatarFallback: {
        width: 46, height: 46, borderRadius: 23,
        alignItems: "center", justifyContent: "center",
    },
    viewerAvatarInitial: { color: "#fff", fontSize: 20, fontWeight: "700" },
    viewerInfo: { flex: 1 },
    viewerName: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
    viewerTime: { fontSize: 12, fontWeight: "400" },
});
