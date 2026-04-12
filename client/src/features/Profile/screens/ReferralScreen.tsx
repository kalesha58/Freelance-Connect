import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import Header from '@/components/Header';
import { Typography, Spacing, BorderRadius } from '@/theme';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import Feather from 'react-native-vector-icons/Feather';

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Referral'>;
};

const ReferralScreen: React.FC<Props> = ({ navigation }) => {
    const { user, isLoading } = useApp();
    const colors = useColors();

    const handleShare = async () => {
        if (!user?.referralCode) return;
        try {
            await Share.share({
                message: `Join Skill Link using my referral code: ${user.referralCode} !`,
                title: 'Skill Link Referral',
            });
        } catch (error) {
            console.error('Error sharing', error);
        }
    };

    if (isLoading || !user) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const referralsList = (user as any).referralsList || [];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Header title="Refer a Friend" onBack={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={styles.content}>
                
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.primary + '15' }]}>
                        <Feather name="gift" size={32} color={colors.primary} />
                    </View>
                    <Text style={[styles.title, { color: colors.text }]}>Invite your friends</Text>
                    <Text style={[styles.description, { color: colors.textSecondary }]}>
                        Share your unique referral code with other freelancers and build your network! (Points system coming soon)
                    </Text>

                    <View style={[styles.codeContainer, { backgroundColor: colors.background }]}>
                        <Text style={[styles.codeLabel, { color: colors.textSecondary }]}>YOUR REFERRAL CODE</Text>
                        <Text style={[styles.codeText, { color: colors.primary }]}>{user.referralCode || 'Pending...'}</Text>
                    </View>

                    <TouchableOpacity style={[styles.shareButton, { backgroundColor: colors.primary }]} onPress={handleShare}>
                        <Feather name="share-2" size={20} color={colors.white} />
                        <Text style={styles.shareButtonText}>Share Code</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.statsContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Referrals</Text>
                    <View style={styles.statsRow}>
                        <View style={[styles.statBox, { backgroundColor: colors.card }]}>
                            <Text style={[styles.statValue, { color: colors.primary }]}>{referralsList.length}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Referred</Text>
                        </View>
                    </View>

                    {referralsList.length > 0 ? (
                        <View style={[styles.listContainer, { backgroundColor: colors.card }]}>
                            {referralsList.map((ref: any) => (
                                <View key={ref._id} style={[styles.listItem, { borderBottomColor: colors.border }]}>
                                    <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + '20' }]}>
                                        <Text style={[styles.avatarText, { color: colors.primary }]}>{ref.name.charAt(0).toUpperCase()}</Text>
                                    </View>
                                    <View style={styles.listText}>
                                        <Text style={[styles.listName, { color: colors.text }]}>{ref.name}</Text>
                                        <Text style={[styles.listDate, { color: colors.textSecondary }]}>Joined {new Date(ref.createdAt).toLocaleDateString()}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>You haven't referred anyone yet.</Text>
                        </View>
                    )}
                </View>

            </ScrollView>
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
    codeText: { fontSize: Typography['2xl'], fontWeight: Typography.bold, letterSpacing: 2 },
    shareButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: Spacing.md, width: '100%', borderRadius: 999,
    },
    shareButtonText: { fontSize: Typography.md, fontWeight: Typography.semibold, marginLeft: Spacing.sm },
    statsContainer: { marginTop: Spacing.sm },
    sectionTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, marginBottom: Spacing.md },
    statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
    statBox: {
        flex: 1, padding: Spacing.lg, borderRadius: BorderRadius.lg,
        alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
    },
    statValue: { fontSize: Typography['2xl'], fontWeight: Typography.bold, marginBottom: 4 },
    statLabel: { fontSize: Typography.xs, textTransform: 'uppercase', fontWeight: Typography.semibold },
    listContainer: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
    listItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1 },
    avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontWeight: Typography.bold, fontSize: Typography.md },
    listText: { marginLeft: Spacing.md, flex: 1 },
    listName: { fontSize: Typography.md, fontWeight: Typography.medium },
    listDate: { fontSize: Typography.xs, marginTop: 2 },
    emptyState: { padding: Spacing.xl, alignItems: 'center', borderRadius: BorderRadius.lg },
    emptyText: { fontStyle: 'italic' }
});

export default ReferralScreen;
