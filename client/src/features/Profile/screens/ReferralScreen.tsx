import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Clipboard,
    Modal,
    RefreshControl,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import Header from '@/components/Header';
import { Typography, Spacing, BorderRadius } from '@/theme';
import { useColors } from '@/hooks/useColors';
import { ReferralHistoryItem, ReferralSummary, useApp } from '@/context/AppContext';
import Feather from 'react-native-vector-icons/Feather';
import {
    REFERRAL_STATUS_META,
    ReferralStatus,
    buildShareMessage,
    inviteUrlForCode,
} from '@/utils/referralHelpers';

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Referral'>;
};

const milestoneLabel: Record<string, string> = {
    profileCompleted: 'Profile completed',
    firstJobApplied: 'First job applied',
    firstJobPosted: 'First job posted',
    firstHire: 'First hire',
};

const ReferralScreen: React.FC<Props> = ({ navigation }) => {
    const { user, fetchReferralSummary, applyReferralCode } = useApp();
    const colors = useColors();

    const [summary, setSummary] = useState<ReferralSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [applyModalVisible, setApplyModalVisible] = useState(false);
    const [applyCode, setApplyCode] = useState('');
    const [applying, setApplying] = useState(false);

    const loadSummary = useCallback(async () => {
        try {
            const data = await fetchReferralSummary();
            setSummary(data);
        } catch (err: any) {
            console.warn('Referral summary error:', err?.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [fetchReferralSummary]);

    useEffect(() => {
        loadSummary();
    }, [loadSummary]);

    const referralCode = summary?.referralCode || user?.referralCode || '';

    const handleShare = async () => {
        if (!referralCode) return;
        try {
            await Share.share({
                message: buildShareMessage(referralCode),
                title: 'Skill Link Referral',
            });
        } catch (error) {
            console.error('Error sharing', error);
        }
    };

    const handleCopy = () => {
        if (!referralCode) return;
        Clipboard.setString(referralCode);
        Alert.alert('Copied', 'Referral code copied to clipboard.');
    };

    const handleCopyLink = () => {
        if (!referralCode) return;
        Clipboard.setString(inviteUrlForCode(referralCode));
        Alert.alert('Copied', 'Invite link copied to clipboard.');
    };

    const handleApply = async () => {
        if (!applyCode.trim()) {
            Alert.alert('Code required', 'Enter a referral code to continue.');
            return;
        }
        setApplying(true);
        try {
            await applyReferralCode(applyCode);
            setApplyModalVisible(false);
            setApplyCode('');
            Alert.alert('Success', 'Referral code applied. Thank you!');
            await loadSummary();
        } catch (err: any) {
            Alert.alert('Could not apply code', err?.message || 'Something went wrong.');
        } finally {
            setApplying(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadSummary();
    };

    const stats = useMemo(() => {
        if (!summary) return { total: 0, rewarded: 0, pending: 0 };
        const total = summary.history.length;
        const rewarded = summary.history.filter((h) => h.status === 'rewarded').length;
        const pending = summary.history.filter(
            (h) => h.status === 'signed_up' || h.status === 'milestone_completed'
        ).length;
        return { total, rewarded, pending };
    }, [summary]);

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Header title="Refer & Earn" onBack={() => navigation.goBack()} />
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.primary + '15' }]}>
                        <Feather name="gift" size={32} color={colors.primary} />
                    </View>
                    <Text style={[styles.title, { color: colors.text }]}>Invite & Earn</Text>
                    <Text style={[styles.description, { color: colors.textSecondary }]}>
                        Share your code with friends. When they sign up and hit a milestone you'll
                        earn credits and perks automatically.
                    </Text>

                    <View style={[styles.codeContainer, { backgroundColor: colors.background }]}>
                        <Text style={[styles.codeLabel, { color: colors.textSecondary }]}>YOUR REFERRAL CODE</Text>
                        <Text style={[styles.codeText, { color: colors.primary }]}>{referralCode || 'Pending...'}</Text>
                        <View style={styles.codeActionsRow}>
                            <TouchableOpacity
                                style={[styles.codeActionBtn, { borderColor: colors.border }]}
                                onPress={handleCopy}
                            >
                                <Feather name="copy" size={14} color={colors.text} />
                                <Text style={[styles.codeActionText, { color: colors.text }]}>Copy code</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.codeActionBtn, { borderColor: colors.border }]}
                                onPress={handleCopyLink}
                            >
                                <Feather name="link" size={14} color={colors.text} />
                                <Text style={[styles.codeActionText, { color: colors.text }]}>Copy link</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.shareButton, { backgroundColor: colors.primary }]}
                        onPress={handleShare}
                    >
                        <Feather name="share-2" size={20} color={colors.white} />
                        <Text style={[styles.shareButtonText, { color: colors.white }]}>Share Code</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.statsRow}>
                    <View style={[styles.statBox, { backgroundColor: colors.card }]}>
                        <Text style={[styles.statValue, { color: colors.primary }]}>{summary?.referralCount ?? stats.total}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Referrals</Text>
                    </View>
                    <View style={[styles.statBox, { backgroundColor: colors.card }]}>
                        <Text style={[styles.statValue, { color: colors.success }]}>
                            {summary?.rewardsEarned ?? 0}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Credits earned</Text>
                    </View>
                    <View style={[styles.statBox, { backgroundColor: colors.card }]}>
                        <Text style={[styles.statValue, { color: colors.warning }]}>{stats.pending}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>In progress</Text>
                    </View>
                </View>

                {summary && (summary.perks.premiumChatUnlocks > 0 || summary.perks.freeJobBoosts > 0) && (
                    <View style={[styles.perksCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your perks</Text>
                        {summary.perks.premiumChatUnlocks > 0 && (
                            <View style={styles.perkRow}>
                                <Feather name="message-circle" size={16} color={colors.primary} />
                                <Text style={[styles.perkText, { color: colors.text }]}>
                                    {summary.perks.premiumChatUnlocks} premium chat unlocks
                                </Text>
                            </View>
                        )}
                        {summary.perks.freeJobBoosts > 0 && (
                            <View style={styles.perkRow}>
                                <Feather name="zap" size={16} color={colors.warning} />
                                <Text style={[styles.perkText, { color: colors.text }]}>
                                    {summary.perks.freeJobBoosts} free job boosts
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {!summary?.referredBy && (
                    <TouchableOpacity
                        style={[styles.applyCard, { borderColor: colors.border, backgroundColor: colors.card }]}
                        onPress={() => setApplyModalVisible(true)}
                    >
                        <View style={[styles.applyIcon, { backgroundColor: colors.primary + '20' }]}>
                            <Feather name="plus" size={18} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.applyTitle, { color: colors.text }]}>Have a referral code?</Text>
                            <Text style={[styles.applySub, { color: colors.textSecondary }]}>
                                Apply it now to credit the friend who invited you.
                            </Text>
                        </View>
                        <Feather name="chevron-right" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}

                <Text style={[styles.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
                    Referral history
                </Text>

                {summary && summary.history.length > 0 ? (
                    <View style={[styles.listContainer, { backgroundColor: colors.card }]}>
                        {summary.history.map((item) => (
                            <ReferralRow key={item._id} item={item} />
                        ))}
                    </View>
                ) : (
                    <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
                        <Feather name="users" size={28} color={colors.textSecondary} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            You haven't referred anyone yet.
                        </Text>
                    </View>
                )}
            </ScrollView>

            <Modal
                visible={applyModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setApplyModalVisible(false)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Apply referral code</Text>
                        <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
                            Enter the code your friend shared. This can only be done once.
                        </Text>
                        <TextInput
                            value={applyCode}
                            onChangeText={setApplyCode}
                            autoCapitalize="none"
                            autoCorrect={false}
                            placeholder="e.g. johnsmith1234"
                            placeholderTextColor={colors.textSecondary}
                            style={[
                                styles.modalInput,
                                { color: colors.text, borderColor: colors.border, backgroundColor: colors.background },
                            ]}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                onPress={() => setApplyModalVisible(false)}
                                style={[styles.modalBtn, { borderColor: colors.border }]}
                                disabled={applying}
                            >
                                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleApply}
                                style={[styles.modalBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                                disabled={applying}
                            >
                                {applying ? (
                                    <ActivityIndicator size="small" color={colors.white} />
                                ) : (
                                    <Text style={[styles.modalBtnText, { color: colors.white }]}>Apply</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const ReferralRow: React.FC<{ item: ReferralHistoryItem }> = ({ item }) => {
    const colors = useColors();
    const meta = REFERRAL_STATUS_META[item.status as ReferralStatus];
    const toneColor =
        meta.tone === 'success'
            ? colors.success
            : meta.tone === 'progress'
            ? colors.primary
            : meta.tone === 'danger'
            ? colors.destructive
            : colors.textSecondary;

    const milestoneText = useMemo(() => {
        const completed = Object.entries(item.milestones || {})
            .filter(([_, v]: any) => v?.done)
            .map(([k]) => milestoneLabel[k] || k);
        return completed.join(', ');
    }, [item.milestones]);

    return (
        <View style={[styles.listItem, { borderBottomColor: colors.border }]}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.avatarText, { color: colors.primary }]}>
                    {(item.user?.name || '?').charAt(0).toUpperCase()}
                </Text>
            </View>
            <View style={styles.listText}>
                <Text style={[styles.listName, { color: colors.text }]}>{item.user?.name || 'Unknown user'}</Text>
                <Text style={[styles.listDate, { color: colors.textSecondary }]}>
                    {milestoneText
                        ? milestoneText
                        : `Joined ${new Date(item.createdAt).toLocaleDateString()}`}
                </Text>
                {item.rewardGiven && item.rewardAmount > 0 && (
                    <Text style={[styles.listReward, { color: colors.success }]}>
                        +{item.rewardAmount} credits{item.rewardPerk ? ` · ${item.rewardPerk}` : ''}
                    </Text>
                )}
            </View>
            <View style={[styles.statusChip, { backgroundColor: toneColor + '20' }]}>
                <Text style={[styles.statusChipText, { color: toneColor }]}>{meta.label}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: Spacing.lg, paddingBottom: Spacing['3xl'] },
    card: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
        marginBottom: Spacing.xl,
        borderWidth: 1,
    },
    iconCircle: {
        width: 64, height: 64, borderRadius: 32,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    title: { fontSize: Typography.xl, fontWeight: Typography.bold, marginBottom: Spacing.sm },
    description: { fontSize: Typography.sm, textAlign: 'center', marginBottom: Spacing.lg, lineHeight: 20 },
    codeContainer: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
        width: '100%',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    codeLabel: { fontSize: Typography.xs, fontWeight: Typography.bold, marginBottom: Spacing.xs },
    codeText: { fontSize: Typography['2xl'], fontWeight: Typography.bold, letterSpacing: 2, marginBottom: Spacing.md },
    codeActionsRow: { flexDirection: 'row', gap: Spacing.sm },
    codeActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: 999,
        borderWidth: 1,
    },
    codeActionText: { fontSize: Typography.xs, fontWeight: Typography.semibold },
    shareButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: Spacing.md, width: '100%', borderRadius: 999,
        gap: Spacing.sm,
    },
    shareButtonText: { fontSize: Typography.md, fontWeight: Typography.semibold },
    statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
    statBox: {
        flex: 1, padding: Spacing.md, borderRadius: BorderRadius.lg,
        alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
    },
    statValue: { fontSize: Typography.xl, fontWeight: Typography.bold, marginBottom: 4 },
    statLabel: { fontSize: 10, textTransform: 'uppercase', fontWeight: Typography.semibold, textAlign: 'center' },
    perksCard: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
        borderWidth: 1,
    },
    perkRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.xs },
    perkText: { fontSize: Typography.sm, fontWeight: Typography.medium },
    applyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        marginBottom: Spacing.md,
    },
    applyIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    applyTitle: { fontSize: Typography.sm, fontWeight: Typography.semibold },
    applySub: { fontSize: Typography.xs, marginTop: 2 },
    sectionTitle: { fontSize: Typography.md, fontWeight: Typography.bold, marginBottom: Spacing.sm },
    listContainer: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
    listItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1 },
    avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontWeight: Typography.bold, fontSize: Typography.md },
    listText: { marginLeft: Spacing.md, flex: 1 },
    listName: { fontSize: Typography.md, fontWeight: Typography.medium },
    listDate: { fontSize: Typography.xs, marginTop: 2 },
    listReward: { fontSize: Typography.xs, marginTop: 2, fontWeight: Typography.semibold },
    statusChip: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: 999 },
    statusChipText: { fontSize: 10, fontWeight: Typography.bold, textTransform: 'uppercase' },
    emptyState: {
        padding: Spacing.xl,
        alignItems: 'center',
        borderRadius: BorderRadius.lg,
        gap: Spacing.sm,
    },
    emptyText: { fontStyle: 'italic' },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: Spacing.lg,
    },
    modalCard: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
    },
    modalTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, marginBottom: Spacing.xs },
    modalSub: { fontSize: Typography.sm, marginBottom: Spacing.md },
    modalInput: {
        borderWidth: 1,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        fontSize: Typography.md,
        marginBottom: Spacing.md,
    },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm },
    modalBtn: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: 999,
        borderWidth: 1,
        minWidth: 90,
        alignItems: 'center',
    },
    modalBtnText: { fontSize: Typography.sm, fontWeight: Typography.semibold },
});

export default ReferralScreen;
