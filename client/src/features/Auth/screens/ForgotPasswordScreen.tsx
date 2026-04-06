import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import Header from '@/components/Header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '@/theme';
import { isValidEmailOrPhone } from '@/utils/validation';

import { useApp } from '@/context/AppContext';

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;
};

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { forgotPassword } = useApp();
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async () => {
        if (!isValidEmailOrPhone(emailOrPhone)) {
            setError('Enter a valid email or phone number');
            return;
        }

        setError('');
        setLoading(true);

        try {
            await forgotPassword(emailOrPhone);
            setLoading(false);
            navigation.navigate('OTPVerification', {
                email: emailOrPhone,
                flow: 'forgot',
            });
        } catch (err: any) {
            setLoading(false);
            setError(err.message || 'Failed to send reset code.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

            <Header
                onBack={() => navigation.goBack()}
                title="Forgot Password"
            />

            <View style={[styles.content, { paddingBottom: Spacing['2xl'] + insets.bottom }]}>
                <View style={styles.iconBox}>
                    <Text style={styles.icon}>🔐</Text>
                </View>

                <Text style={styles.heading}>Reset Password</Text>
                <Text style={styles.description}>
                    Enter your registered email or phone number. We'll send you a one-time
                    code to reset your password.
                </Text>

                <Input
                    label="Email / Phone"
                    placeholder="you@example.com or +91 9876543210"
                    value={emailOrPhone}
                    onChangeText={(t) => {
                        setEmailOrPhone(t);
                        setError('');
                    }}
                    error={error}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleSendOTP}
                    leftIcon="mail"
                />

                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        💡 We'll send a 6-digit verification code to confirm your identity.
                    </Text>
                </View>

                <View style={styles.spacer} />

                <Button
                    title="Send OTP"
                    onPress={handleSendOTP}
                    loading={loading}
                    disabled={!emailOrPhone}
                />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.base,
        paddingBottom: Spacing['2xl'],
    },
    iconBox: {
        width: 64,
        height: 64,
        borderRadius: 18,
        backgroundColor: Colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    icon: {
        fontSize: 30,
    },
    heading: {
        fontSize: Typography['2xl'],
        fontWeight: Typography.bold,
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    description: {
        fontSize: Typography.base,
        color: Colors.textSecondary,
        lineHeight: Typography.base * Typography.relaxed,
        marginBottom: Spacing.xl,
    },
    infoBox: {
        backgroundColor: Colors.primaryLight,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginTop: Spacing.xs,
    },
    infoText: {
        fontSize: Typography.sm,
        color: Colors.primary,
        lineHeight: Typography.sm * Typography.relaxed,
    },
    spacer: { flex: 1 },
});

export default ForgotPasswordScreen;
