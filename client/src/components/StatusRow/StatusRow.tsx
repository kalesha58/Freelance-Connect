import React, { useMemo } from "react";
import {
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import { launchImageLibrary } from "react-native-image-picker";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { IStatus } from "@/navigation/types";

/**
 * A group of all statuses from a single user, sorted oldest-first for
 * chronological playback in the StatusViewer.
 */
interface StatusGroup {
    userId: string;
    userName: string;
    userAvatar?: string;
    /** Sorted oldest-first so the viewer plays them in chronological order */
    statuses: IStatus[];
    /** True if at least one status in this group has not been viewed */
    hasUnviewed: boolean;
}

/**
 * Builds a map of userId -> StatusGroup from a flat IStatus array.
 * Each group's statuses are sorted oldest-first for the viewer.
 */
function groupStatusesByUser(statuses: IStatus[]): Record<string, StatusGroup> {
    const groups: Record<string, StatusGroup> = {};
    for (const status of statuses) {
        if (!groups[status.userId]) {
            groups[status.userId] = {
                userId: status.userId,
                userName: status.userName,
                userAvatar: status.userAvatar,
                statuses: [],
                hasUnviewed: false,
            };
        }
        groups[status.userId].statuses.push(status);
        if (!status.viewed) groups[status.userId].hasUnviewed = true;
    }
    // Sort each group's statuses oldest-first (chronological viewing order)
    for (const g of Object.values(groups)) {
        g.statuses.sort((a, b) => a.createdAt - b.createdAt);
    }
    return groups;
}

/**
 * StatusRow renders the Instagram-style story bar at the top of the community
 * feed. Each user appears only once, regardless of how many statuses they have.
 * Multiple statuses from the same user play sequentially in the StatusViewer.
 */
export function StatusRow() {
    const colors = useColors();
    const navigation = useNavigation<any>();
    const { user, statuses, addStatus } = useApp();

    const groups = useMemo(() => groupStatusesByUser(statuses), [statuses]);
    const myGroup = user ? groups[user._id] : undefined;
    // Other users' groups, ordered newest-first (most recent activity first)
    const otherGroups = useMemo(
        () =>
            Object.values(groups)
                .filter(g => g.userId !== user?._id)
                // Unviewed groups first, then sorted by most recent status
                .sort((a, b) => {
                    if (a.hasUnviewed !== b.hasUnviewed) return a.hasUnviewed ? -1 : 1;
                    const latestA = Math.max(...a.statuses.map(s => s.createdAt));
                    const latestB = Math.max(...b.statuses.map(s => s.createdAt));
                    return latestB - latestA;
                }),
        [groups, user?._id]
    );

    // ─── Handlers ────────────────────────────────────────────────────────────

    const handleAddStatus = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: "photo",
                quality: 0.85,
                selectionLimit: 1,
            });
            if (result.didCancel) return;
            const asset = result.assets?.[0];
            if (!asset?.uri) return;
            await addStatus(asset.uri);
        } catch (e: any) {
            Alert.alert("Error", e.message ?? "Could not add status. Please try again.");
        }
    };

    const openViewer = (group: StatusGroup) => {
        if (!group.statuses.length) return;
        navigation.navigate("StatusViewer", {
            statuses: group.statuses,
            initialIndex: 0,
        });
    };

    // ─── Render helpers ───────────────────────────────────────────────────────

    const AvatarContent = ({ avatar, name, bg }: { avatar?: string; name: string; bg: string }) =>
        avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImg} />
        ) : (
            <View style={[styles.avatarFallback, { backgroundColor: bg }]}>
                <Text style={styles.avatarInitial}>{name.charAt(0).toUpperCase()}</Text>
            </View>
        );

    const renderMyStory = () => {
        const ringColor = myGroup?.hasUnviewed ? colors.primary : colors.border;
        const ringWidth = myGroup?.hasUnviewed ? 2.5 : 1.5;

        return (
            <TouchableOpacity
                style={styles.storyItem}
                onPress={myGroup ? () => openViewer(myGroup) : handleAddStatus}
                activeOpacity={0.8}
            >
                <View style={styles.ringWrapper}>
                    <View
                        style={[
                            myGroup ? styles.gradientRing : styles.dashedRing,
                            { borderColor: myGroup ? ringColor : colors.border, borderWidth: ringWidth },
                        ]}
                    >
                        <AvatarContent
                            avatar={user?.avatar || user?.profilePic}
                            name={user?.name ?? "?"}
                            bg={colors.primary}
                        />
                    </View>

                    {/* Always show the + badge so user can add more statuses */}
                    <TouchableOpacity
                        style={[styles.plusBadge, { backgroundColor: colors.primary, borderColor: colors.card }]}
                        onPress={handleAddStatus}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                        <Feather name="plus" size={10} color="#fff" />
                    </TouchableOpacity>

                    {/* Count badge when user has > 1 status */}
                    {myGroup && myGroup.statuses.length > 1 && (
                        <View style={[styles.countBadge, { backgroundColor: colors.primary, borderColor: colors.card }]}>
                            <Text style={styles.countBadgeText}>{myGroup.statuses.length}</Text>
                        </View>
                    )}
                </View>
                <Text style={[styles.storyLabel, { color: colors.foreground }]} numberOfLines={1}>
                    {myGroup ? "Your Story" : "Add Status"}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderOtherGroup = ({ item }: { item: StatusGroup }) => {
        const ringColor = item.hasUnviewed ? colors.primary : colors.border;
        const ringWidth = item.hasUnviewed ? 2.5 : 1.5;
        return (
            <TouchableOpacity
                style={styles.storyItem}
                onPress={() => openViewer(item)}
                activeOpacity={0.8}
            >
                <View style={styles.ringWrapper}>
                    <View style={[styles.gradientRing, { borderColor: ringColor, borderWidth: ringWidth }]}>
                        <AvatarContent
                            avatar={item.userAvatar}
                            name={item.userName}
                            bg={colors.purpleAccent}
                        />
                    </View>
                    {item.statuses.length > 1 && (
                        <View style={[styles.countBadge, { backgroundColor: colors.primary, borderColor: colors.card }]}>
                            <Text style={styles.countBadgeText}>{item.statuses.length}</Text>
                        </View>
                    )}
                </View>
                <Text style={[styles.storyLabel, { color: colors.foreground }]} numberOfLines={1}>
                    {item.userName.split(" ")[0]}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <FlatList
                data={otherGroups}
                keyExtractor={g => g.userId}
                renderItem={renderOtherGroup}
                ListHeaderComponent={renderMyStory}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
        paddingVertical: 10,
    },
    listContent: {
        paddingHorizontal: 12,
        paddingBottom: 2,
    },
    storyItem: {
        alignItems: "center",
        width: 72,
        marginRight: 8,
    },
    ringWrapper: {
        position: "relative",
        marginBottom: 6,
    },
    /** Solid ring — used when the user has at least one status */
    gradientRing: {
        width: 64,
        height: 64,
        borderRadius: 32,
        padding: 3,
        alignItems: "center",
        justifyContent: "center",
    },
    /** Dashed ring — shown on "My Story" when the user has no status yet */
    dashedRing: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderStyle: "dashed",
        padding: 3,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarImg: {
        width: "100%",
        height: "100%",
        borderRadius: 28,
    },
    avatarFallback: {
        width: "100%",
        height: "100%",
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarInitial: { color: "#fff", fontSize: 22, fontWeight: "700" },
    plusBadge: {
        position: "absolute",
        bottom: -1,
        right: -1,
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
    },
    /** Shows the number of active statuses for a user */
    countBadge: {
        position: "absolute",
        top: -2,
        right: -2,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 3,
    },
    countBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
    storyLabel: {
        fontSize: 11,
        fontWeight: "500",
        textAlign: "center",
    },
});
