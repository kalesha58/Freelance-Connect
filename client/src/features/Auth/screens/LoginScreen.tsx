import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import Header from '@/components/Header';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography, Spacing } from '@/theme';
import { validateLogin, LoginErrors } from '@/utils/validation';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
    const { signIn } = useApp();
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState<LoginErrors>({});
    const [loading, setLoading] = useState(false);

    const clearError = (field: keyof LoginErrors) => {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleLogin = async () => {
        const validationErrors = validateLogin(emailOrPhone, password);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            await signIn(emailOrPhone, password);
            // RootNavigator will automatically switch to Main stack when user is set
        } catch (error: any) {
            setLoading(false);
            Alert.alert('Login Failed', error.message || 'Please check your credentials and try again.');
        }
    };


    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >

            <Header
                title="Login"
                rightElement={
                    <TouchableOpacity onPress={() => navigation.navigate('Signup', { role: 'freelancer' })}>
                        <Text style={[styles.signupLink, { color: '#fff' }]}>Sign up</Text>
                    </TouchableOpacity>
                }
            />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[
                    styles.content,
                    { paddingBottom: Spacing['3xl'] + insets.bottom }
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Hero section */}
                <View style={styles.hero}>
                    <View style={[styles.logoMini, { backgroundColor: colors.headerBackground }]}>
                        <Text style={styles.logoText}>T</Text>
                    </View>
                    <Text style={[styles.heading, { color: colors.foreground }]}>Welcome back</Text>
                    <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
                        Sign in to your Tasker account
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <Input
                        label="Email Address"
                        placeholder="you@example.com"
                        value={emailOrPhone}
                        onChangeText={(t) => {
                            setEmailOrPhone(t);
                            clearError('emailOrPhone');
                        }}
                        error={errors.emailOrPhone}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        returnKeyType="next"
                        leftIcon="mail"
                    />

                    <Input
                        label="Password"
                        placeholder="Your password"
                        value={password}
                        onChangeText={(t) => {
                            setPassword(t);
                            clearError('password');
                        }}
                        error={errors.password}
                        isPassword
                        returnKeyType="done"
                        onSubmitEditing={handleLogin}
                        leftIcon="lock"
                    />

                    {/* Remember me + Forgot password row */}
                    <View style={styles.optionsRow}>
                        <TouchableOpacity
                            style={styles.rememberRow}
                            onPress={() => setRememberMe(!rememberMe)}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.checkbox,
                                { borderColor: colors.border },
                                rememberMe && { backgroundColor: colors.headerBackground, borderColor: colors.headerBackground },
                            ]}>
                                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={[styles.rememberText, { color: colors.mutedForeground }]}>Remember me</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                            <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Login button */}
                <Button
                    title="Login"
                    onPress={handleLogin}
                    loading={loading}
                    style={styles.loginBtn}
                />


                {/* Sign up link */}
                <View style={styles.signupRow}>
                    <Text style={[styles.noAccountText, { color: colors.mutedForeground }]}>Don't have an account? </Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Signup', { role: 'freelancer' })}
                    >
                        <Text style={[styles.signupAction, { color: colors.primary }]}>Create Account</Text>
                    </TouchableOpacity>
                </View>

                {/* Terms notice */}
                <Text style={[styles.terms, { color: colors.mutedForeground }]}>
                    By logging in, you agree to our{' '}
                    <Text style={{ color: colors.primary }}>Terms of Service</Text>
                    {' '}and{' '}
                    <Text style={{ color: colors.primary }}>Privacy Policy</Text>
                </Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    signupLink: {
        fontSize: Typography.base,
        fontWeight: Typography.semibold,
    },
    scroll: { flex: 1 },
    content: {
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing['3xl'],
    },
    hero: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        marginBottom: Spacing.base,
    },
    logoMini: {
        width: 60,
        height: 60,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.base,
    },
    logoText: {
        fontSize: Typography['2xl'],
        fontWeight: Typography.extrabold,
        color: '#FFFFFF',
    },
    heading: {
        fontSize: Typography['3xl'],
        fontWeight: Typography.bold,
        marginBottom: Spacing.xs,
    },
    subheading: {
        fontSize: Typography.base,
    },
    form: {
        gap: 0,
        marginBottom: Spacing.sm,
    },
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        marginTop: -Spacing.xs,
    },
    rememberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: Typography.bold,
    },
    rememberText: {
        fontSize: Typography.sm,
    },
    forgotText: {
        fontSize: Typography.sm,
        fontWeight: Typography.medium,
    },
    loginBtn: {
        marginBottom: Spacing.lg,
    },
    signupRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.xl,
    },
    noAccountText: {
        fontSize: Typography.base,
    },
    signupAction: {
        fontSize: Typography.base,
        fontWeight: Typography.semibold,
    },
    terms: {
        fontSize: Typography.xs,
        textAlign: 'center',
        marginTop: Spacing.base,
        lineHeight: Typography.xs * Typography.relaxed,
        paddingHorizontal: Spacing.lg,
    },
});

export default LoginScreen;
