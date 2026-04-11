import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/types';
import Header from '@/components/Header';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { Typography, Spacing, BorderRadius } from '@/theme';
import { useColors } from '@/hooks/useColors';
import { isValidPassword, passwordsMatch } from '@/utils/validation';

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;
    route: RouteProp<RootStackParamList, 'ResetPassword'>;
};

interface Requirement {
    label: string;
    met: boolean;
}

const ResetPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const colors = useColors();
    const { resetPassword } = useApp();
    const { email, otp } = route.params;
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
    const [loading, setLoading] = useState(false);

    const requirements: Requirement[] = [
        { label: 'At least 6 characters', met: newPassword.length >= 6 },
        { label: 'Contains a number', met: /\d/.test(newPassword) },
        { label: 'Passwords match', met: !!newPassword && newPassword === confirmPassword },
    ];

    const allMet = requirements.every((r) => r.met);

    const handleReset = () => {
        const errs: typeof errors = {};

        if (!isValidPassword(newPassword)) {
            errs.newPassword = 'Password must be at least 6 characters';
        }
        if (!passwordsMatch(newPassword, confirmPassword)) {
            errs.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        setErrors({});
        setLoading(true);

        const reset = async () => {
            try {
                await resetPassword(email, otp, newPassword);
                setLoading(false);
                Alert.alert(
                    '🎉 Password Reset!',
                    'Your password has been updated successfully. Please log in with your new password.',
                    [
                        {
                            text: 'Login Now',
                            onPress: () =>
                                navigation.reset({ index: 0, routes: [{ name: 'Login' }] }),
                        },
                    ]
                );
            } catch (error: any) {
                setLoading(false);
                Alert.alert('Error', error.message || 'Failed to reset password.');
            }
        };

        reset();
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle={colors.background === '#F8FAFC' ? 'dark-content' : 'light-content'} backgroundColor={colors.background} />

            <Header onBack={() => navigation.goBack()} title="New Password" />

            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    { paddingBottom: Spacing['2xl'] + insets.bottom }
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.iconWrap}>
                    <Text style={styles.icon}>🔒</Text>
                </View>

                <Text style={[styles.heading, { color: colors.text }]}>Set New Password</Text>
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                    Create a strong password you haven't used before.
                </Text>

                <Input
                    label="New Password"
                    placeholder="Min. 6 characters"
                    value={newPassword}
                    onChangeText={(t) => {
                        setNewPassword(t);
                        setErrors((e) => ({ ...e, newPassword: undefined }));
                    }}
                    error={errors.newPassword}
                    isPassword
                    autoFocus
                    leftIcon="lock"
                />

                <Input
                    label="Confirm Password"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChangeText={(t) => {
                        setConfirmPassword(t);
                        setErrors((e) => ({ ...e, confirmPassword: undefined }));
                    }}
                    error={errors.confirmPassword}
                    isPassword
                    returnKeyType="done"
                    onSubmitEditing={handleReset}
                    leftIcon="shield"
                />

                {/* Requirements checklist */}
                <View style={[styles.requirementsBox, { backgroundColor: colors.secondaryLight }]}>
                    <Text style={[styles.requirementsTitle, { color: colors.secondary }]}>Password requirements</Text>
                    {requirements.map((req, i) => (
                        <View key={i} style={styles.reqRow}>
                            <View style={[styles.reqDot, req.met && styles.reqDotMet]}>
                                <Text style={styles.reqCheck}>{req.met ? '✓' : '·'}</Text>
                            </View>
                            <Text style={[styles.reqLabel, { color: colors.textSecondary }, req.met && { color: colors.secondary }]}>
                                {req.label}
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={styles.spacer} />

                <Button
                    title="Reset Password"
                    onPress={handleReset}
                    loading={loading}
                    disabled={!allMet}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: {
        flexGrow: 1,
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing['2xl'],
    },
    iconWrap: {
        width: 64,
        height: 64,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.base,
        marginBottom: Spacing.lg,
    },
    icon: { fontSize: 28 },
    heading: {
        fontSize: Typography['2xl'],
        fontWeight: Typography.bold,
        marginBottom: Spacing.xs,
    },
    description: {
        fontSize: Typography.base,
        marginBottom: Spacing.xl,
        lineHeight: Typography.base * 1.6,
    },
    requirementsBox: {
        backgroundColor: '#F0FDF4', // Success light
        borderRadius: BorderRadius.md,
        padding: Spacing.base,
        marginBottom: Spacing.lg,
        gap: Spacing.sm,
    },
    requirementsTitle: {
        fontSize: Typography.sm,
        fontWeight: Typography.semibold,
        color: '#15803D',
        marginBottom: 4,
    },
    reqRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    reqDot: {
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reqDotMet: {
    },
    reqCheck: {
        fontSize: 10,
        fontWeight: Typography.bold,
    },
    reqLabel: {
        fontSize: Typography.sm,
    },
    reqLabelMet: {
        color: '#166534',
        fontWeight: Typography.medium,
    },
    spacer: { flex: 1, minHeight: Spacing.lg },
});

export default ResetPasswordScreen;
