import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import Header from '@/components/Header';
import { Colors, Typography, Spacing, BorderRadius } from '@/theme';
import { useApp } from '@/context/AppContext';
import Feather from 'react-native-vector-icons/Feather';

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Referral'>;
};

const ReferralScreen: React.FC<Props> = ({ navigation }) => {
    const { user, isLoading } = useApp();

    const handleShare = async () => {
        if (!user?.referralCode) return;
        try {
            await Share.share({
                message: `Join Freelance Connect using my referral code: ${user.referralCode} !`,
                title: 'Freelance Connect Referral',
            });
        } catch (error) {
            console.error('Error sharing', error);
        }
    };

    if (isLoading || !user) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    const referralsList = (user as any).referralsList || [];

    return (
        <View style={styles.container}>
            <Header title="Refer a Friend" onBack={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={styles.content}>
                
                <View style={styles.card}>
                    <View style={styles.iconCircle}>
                        <Feather name="gift" size={32} color={Colors.primary} />
                    </View>
                    <Text style={styles.title}>Invite your friends</Text>
                    <Text style={styles.description}>
                        Share your unique referral code with other freelancers and build your network! (Points system coming soon)
                    </Text>

                    <View style={styles.codeContainer}>
                        <Text style={styles.codeLabel}>YOUR REFERRAL CODE</Text>
                        <Text style={styles.codeText}>{user.referralCode || 'Pending...'}</Text>
                    </View>

                    <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                        <Feather name="share-2" size={20} color={Colors.white} />
                        <Text style={styles.shareButtonText}>Share Code</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.statsContainer}>
                    <Text style={styles.sectionTitle}>Your Referrals</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>{referralsList.length}</Text>
                            <Text style={styles.statLabel}>Total Referred</Text>
                        </View>
                    </View>

                    {referralsList.length > 0 ? (
                        <View style={styles.listContainer}>
                            {referralsList.map((ref: any) => (
                                <View key={ref._id} style={styles.listItem}>
                                    <View style={styles.avatarPlaceholder}>
                                        <Text style={styles.avatarText}>{ref.name.charAt(0).toUpperCase()}</Text>
                                    </View>
                                    <View style={styles.listText}>
                                        <Text style={styles.listName}>{ref.name}</Text>
                                        <Text style={styles.listDate}>Joined {new Date(ref.createdAt).toLocaleDateString()}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>You haven't referred anyone yet.</Text>
                        </View>
                    )}
                </View>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: Spacing.lg, paddingBottom: Spacing['3xl'] },
    card: {
        backgroundColor: Colors.white,
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
        backgroundColor: Colors.primary + '15',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    title: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.text, marginBottom: Spacing.sm },
    description: { fontSize: Typography.sm, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg, lineHeight: 20 },
    codeContainer: {
        backgroundColor: Colors.background,
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
        width: '100%',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    codeLabel: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.textSecondary, marginBottom: Spacing.xs },
    codeText: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.primary, letterSpacing: 2 },
    shareButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: Spacing.md, width: '100%', borderRadius: 999,
    },
    shareButtonText: { color: Colors.white, fontSize: Typography.md, fontWeight: Typography.semibold, marginLeft: Spacing.sm },
    statsContainer: { marginTop: Spacing.sm },
    sectionTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.text, marginBottom: Spacing.md },
    statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
    statBox: {
        flex: 1, backgroundColor: Colors.white, padding: Spacing.lg, borderRadius: BorderRadius.lg,
        alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
    },
    statValue: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.primary, marginBottom: 4 },
    statLabel: { fontSize: Typography.xs, color: Colors.textSecondary, textTransform: 'uppercase', fontWeight: Typography.semibold },
    listContainer: { backgroundColor: Colors.white, borderRadius: BorderRadius.lg, overflow: 'hidden' },
    listItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
    avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary + '20', alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: Colors.primary, fontWeight: Typography.bold, fontSize: Typography.md },
    listText: { marginLeft: Spacing.md, flex: 1 },
    listName: { fontSize: Typography.md, fontWeight: Typography.medium, color: Colors.text },
    listDate: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
    emptyState: { padding: Spacing.xl, alignItems: 'center', backgroundColor: Colors.white, borderRadius: BorderRadius.lg },
    emptyText: { color: Colors.textSecondary, fontStyle: 'italic' }
});

export default ReferralScreen;
