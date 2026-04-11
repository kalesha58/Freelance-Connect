import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/types';
import Header from '@/components/Header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Input from '@/components/Input';
import Button from '@/components/Button';
import ProgressBar from '@/components/ProgressBar';
import { Typography, Spacing, BorderRadius } from '@/theme';
import { validateSignup, SignupErrors } from '@/utils/validation';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Signup'>;
    route: RouteProp<RootStackParamList, 'Signup'>;
};

type UserRole = 'freelancer' | 'hiring';

const SignupScreen: React.FC<Props> = ({ navigation, route }) => {
    // Default to freelancer if not provided
    const insets = useSafeAreaInsets();
    const colors = useColors();
    const [role, setRole] = useState<UserRole>((route.params?.role as UserRole) || 'freelancer');
    const { signUp } = useApp();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [referredByCode, setReferredByCode] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [errors, setErrors] = useState<SignupErrors>({});
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        const validationErrors = validateSignup(
            name, email, password, confirmPassword, termsAccepted
        );

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            await signUp(name, email, password, role, referredByCode);
            // AppContext will set user once signed in, switching them to Main stack automatically
        } catch (error: any) {
            setLoading(false);
            Alert.alert('Signup Failed', error.message || 'There was an error creating your account.');
        }
    };

    const passwordStrength = () => {
        if (!password) return null;
        if (password.length < 6) return { label: 'Too short', color: colors.error };
        if (password.length < 8) return { label: 'Weak', color: colors.warning };
        if (password.length < 12) return { label: 'Good', color: colors.secondary };
        return { label: 'Strong', color: colors.success };
    };

    const strength = passwordStrength();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>

            <Header
                title="Create Account"
                rightElement={<Text style={{ fontSize: 13, color: '#fff', fontWeight: '500' }}>Step 1 of 2</Text>}
            />

            <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
                <ProgressBar currentStep={1} totalSteps={2} showLabel={false} />
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[
                    styles.content,
                    { paddingBottom: Spacing['3xl'] + insets.bottom }
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >

                <Text style={[styles.heading, { color: colors.text }]}>Create Account</Text>
                <Text style={[styles.subheading, { color: colors.textSecondary }]}>Enter your details to get started</Text>

                {/* Role Switcher */}
                <View style={styles.roleContainer}>
                    <Text style={[styles.roleTitle, { color: colors.textSecondary }]}>I want to join as a:</Text>
                    <View style={[styles.roleSwitch, { backgroundColor: colors.border + '40' }]}>
                        <TouchableOpacity
                            style={[styles.roleOption, role === 'freelancer' && styles.roleActive]}
                            onPress={() => setRole('freelancer')}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.roleText, role === 'freelancer' && { color: colors.primary }]}>
                                👨‍💻 Freelancer
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.roleOption, role === 'hiring' && styles.roleActive]}
                            onPress={() => setRole('hiring')}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.roleText, role === 'hiring' && { color: colors.primary }]}>
                                💼 Hiring Partner
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Full Name"
                        placeholder="John Smith"
                        value={name}
                        onChangeText={(t) => { setName(t); setErrors({ ...errors, name: undefined }); }}
                        error={errors.name}
                        autoCapitalize="words"
                        autoComplete="name"
                        leftIcon="user"
                    />

                    <Input
                        label="Email Address"
                        placeholder="you@example.com"
                        value={email}
                        onChangeText={(t) => { setEmail(t); setErrors({ ...errors, emailOrPhone: undefined }); }}
                        error={errors.emailOrPhone}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        leftIcon="mail"
                    />

                    <Input
                        label="Password"
                        placeholder="Min. 6 characters"
                        value={password}
                        onChangeText={(t) => { setPassword(t); setErrors({ ...errors, password: undefined }); }}
                        error={errors.password}
                        isPassword
                        hint={strength ? undefined : '1 uppercase, 1 number, 1 special'}
                        leftIcon="lock"
                    />

                    {strength && (
                        <View style={styles.strengthRow}>
                            <View style={styles.strengthBar}>
                                <View
                                    style={[
                                        styles.strengthFill,
                                        {
                                            width: `${Math.min((password.length / 12) * 100, 100)}%`,
                                            backgroundColor: strength.color,
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={[styles.strengthLabel, { color: strength.color }]}>
                                {strength.label}
                            </Text>
                        </View>
                    )}

                    <Input
                        label="Confirm Password"
                        placeholder="Repeat password"
                        value={confirmPassword}
                        onChangeText={(t) => { setConfirmPassword(t); setErrors({ ...errors, confirmPassword: undefined }); }}
                        error={errors.confirmPassword}
                        isPassword
                        leftIcon="shield"
                    />

                    <Input
                        label="Referral Code (Optional)"
                        placeholder="E.g. johnsmith1234"
                        value={referredByCode}
                        onChangeText={(t) => setReferredByCode(t)}
                        leftIcon="user-plus"
                        autoCapitalize="none"
                    />

                    <TouchableOpacity
                        style={styles.termsRow}
                        onPress={() => setTermsAccepted(!termsAccepted)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                            {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                            I agree to the{' '}
                            <Text style={[styles.link, { color: colors.primary }]}>Terms & Conditions</Text>
                            {' '}and{' '}
                            <Text style={[styles.link, { color: colors.primary }]}>Privacy Policy</Text>
                        </Text>
                    </TouchableOpacity>
                    {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}
                </View>

                <Button
                    title="Create Account"
                    onPress={handleSignup}
                    loading={loading}
                    style={styles.submitBtn}
                />


                <View style={styles.loginRow}>
                    <Text style={[styles.loginText, { color: colors.textSecondary }]}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={[styles.link, { color: colors.primary }]}>Login</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    stepText: { fontSize: Typography.sm },
    scroll: { flex: 1 },
    content: {
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing['3xl'],
    },
    heading: {
        fontSize: Typography['3xl'],
        fontWeight: Typography.bold,
        marginBottom: Spacing.xs,
    },
    subheading: {
        fontSize: Typography.sm,
        marginBottom: Spacing.lg,
    },
    roleContainer: {
        marginBottom: Spacing.xl,
    },
    roleTitle: {
        fontSize: Typography.sm,
        fontWeight: Typography.semibold,
        marginBottom: Spacing.sm,
    },
    roleSwitch: {
        flexDirection: 'row',
        padding: 4,
        borderRadius: BorderRadius.md,
        gap: 4,
    },
    roleOption: {
        flex: 1,
        paddingVertical: Spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.sm,
    },
    roleActive: {
        background: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    roleText: {
        fontSize: Typography.sm,
        fontWeight: Typography.medium,
    },
    roleTextActive: {
        fontWeight: Typography.semibold,
    },
    form: { gap: 0 },
    strengthRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginTop: -Spacing.sm,
        marginBottom: Spacing.md,
    },
    strengthBar: {
        flex: 1,
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    strengthFill: {
        height: '100%',
        borderRadius: 2,
    },
    strengthLabel: {
        fontSize: Typography.xs,
        fontWeight: Typography.medium,
        minWidth: 50,
        textAlign: 'right',
    },
    termsRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
        marginTop: Spacing.xs,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 5,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 1,
    },
    checkboxChecked: {
    },
    checkmark: {
        fontSize: 11,
        fontWeight: Typography.bold,
    },
    termsText: {
        flex: 1,
        fontSize: Typography.sm,
        lineHeight: Typography.sm * Typography.relaxed,
    },
    link: {
        fontWeight: Typography.medium,
    },
    errorText: {
        fontSize: Typography.xs,
        marginTop: -Spacing.sm,
        marginBottom: Spacing.sm,
    },
    submitBtn: { marginTop: Spacing.base },
    loginRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.base,
    },
    loginText: { fontSize: Typography.sm },
});

export default SignupScreen;
