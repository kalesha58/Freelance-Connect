import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/types';
import Header from '@/components/Header';
import OTPInput from '@/components/OTPInput';
import Button from '@/components/Button';
import ProgressBar from '@/components/ProgressBar';
import useOTPTimer from '@/hooks/useOTPTimer';
import { Colors, Typography, Spacing, BorderRadius } from '@/theme';
import { useApp } from '@/context/AppContext';

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'OTPVerification'>;
    route: RouteProp<RootStackParamList, 'OTPVerification'>;
};

const OTPVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
    const { signUp } = useApp();
    const { email, flow } = route.params;
    const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
    const [otpError, setOtpError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const { timeLeft, isExpired, restart } = useOTPTimer(30);

    // Mask email/phone for display
    const maskedEmail = (() => {
        if (email.includes('@')) {
            const [user, domain] = email.split('@');
            return `${user.slice(0, 2)}***@${domain}`;
        }
        return `${email.slice(0, 3)}***${email.slice(-3)}`;
    })();

    const filledCount = otp.filter(Boolean).length;
    const isComplete = filledCount === 6;

    const handleVerify = () => {
        if (!isComplete) return;

        const code = otp.join('');

        // For demo: accept "123456" as valid OTP
        if (code !== '123456') {
            setOtpError(true);
            Alert.alert('Invalid OTP', 'The code you entered is incorrect. Please try again.');
            return;
        }

        setOtpError(false);
        setLoading(true);

        setTimeout(async () => {
            if (flow === 'forgot') {
                setLoading(false);
                navigation.navigate('ResetPassword', { email, otp: code });
            } else {
                // signup flow — create user and go to home
                try {
                    const { name, role } = route.params;
                    await signUp(name || email.split('@')[0], email, role || 'freelancer');
                    // RootNavigator will automatically switch to Main stack when user is set
                } catch (e) {
                    setLoading(false);
                    Alert.alert('Error', 'Signup failed. Please try again.');
                }
            }
        }, 1200);
    };

    const handleResend = () => {
        if (!isExpired) return;
        setResendLoading(true);
        setOtp(Array(6).fill(''));
        setOtpError(false);

        setTimeout(() => {
            setResendLoading(false);
            restart();
            Alert.alert('OTP Sent', `A new code has been sent to ${maskedEmail}`);
        }, 1000);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: Colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >

            <Header
                onBack={() => navigation.goBack()}
                title="Verify OTP"
                rightElement={<Text style={{ fontSize: 13, color: '#fff', fontWeight: '500' }}>Step 2 of 2</Text>}
            />

            <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
                <ProgressBar currentStep={2} totalSteps={2} showLabel={false} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Icon */}
                <View style={styles.iconWrap}>
                    <Text style={styles.icon}>📩</Text>
                </View>

                {/* Title & description */}
                <Text style={styles.heading}>Check your inbox</Text>
                <Text style={styles.description}>
                    We've sent a 6-digit verification code to
                </Text>
                <Text style={styles.email}>{maskedEmail}</Text>

                {/* Demo hint */}
                <View style={styles.demoHint}>
                    <Text style={styles.demoHintText}>🔑 Demo code: 123456</Text>
                </View>

                {/* OTP input */}
                <View style={styles.otpSection}>
                    <OTPInput
                        length={6}
                        value={otp}
                        onChange={(val) => {
                            setOtp(val);
                            setOtpError(false);
                        }}
                        error={otpError}
                    />

                    {otpError && (
                        <Text style={styles.errorText}>
                            Incorrect code. Please check and try again.
                        </Text>
                    )}
                </View>

                {/* Timer */}
                <View style={styles.timerRow}>
                    {!isExpired ? (
                        <Text style={styles.timerText}>
                            Code expires in{' '}
                            <Text style={styles.timerCount}>{formatTime(timeLeft)}</Text>
                        </Text>
                    ) : (
                        <Text style={styles.timerExpired}>Code has expired</Text>
                    )}
                </View>

                {/* Resend */}
                <View style={styles.resendRow}>
                    <Text style={styles.resendLabel}>Didn't receive the code? </Text>
                    <TouchableOpacity
                        onPress={handleResend}
                        disabled={!isExpired || resendLoading}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.resendBtn, (!isExpired || resendLoading) && styles.resendDisabled]}>
                            {resendLoading ? 'Sending...' : 'Resend OTP'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Progress indicators */}
                <View style={styles.progressDots}>
                    {Array(6).fill(0).map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.progressDot,
                                i < filledCount && styles.progressDotFilled,
                            ]}
                        />
                    ))}
                </View>

                <View style={styles.spacer} />

                {/* Verify button */}
                <Button
                    title={`Verify & Continue ${isComplete ? '→' : `(${filledCount}/6)`}`}
                    onPress={handleVerify}
                    loading={loading}
                    disabled={!isComplete}
                    style={styles.verifyBtn}
                />

                {/* Change email link */}
                <TouchableOpacity
                    style={styles.changeRow}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.changeText}>
                        Wrong {email.includes('@') ? 'email' : 'number'}?{' '}
                        <Text style={styles.changeLink}>Change it</Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing['2xl'],
        alignItems: 'center',
    },
    iconWrap: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: Colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.xl,
        marginBottom: Spacing.lg,
    },
    icon: {
        fontSize: 36,
    },
    heading: {
        fontSize: Typography['2xl'],
        fontWeight: Typography.bold,
        color: Colors.text,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    description: {
        fontSize: Typography.base,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    email: {
        fontSize: Typography.base,
        fontWeight: Typography.semibold,
        color: Colors.text,
        marginTop: 4,
        marginBottom: Spacing.base,
        textAlign: 'center',
    },
    demoHint: {
        backgroundColor: '#FFF7ED',
        borderRadius: BorderRadius.sm,
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: '#FED7AA',
    },
    demoHintText: {
        fontSize: Typography.sm,
        color: '#92400E',
        fontWeight: Typography.medium,
    },
    otpSection: {
        width: '100%',
        marginBottom: Spacing.base,
    },
    errorText: {
        fontSize: Typography.sm,
        color: Colors.error,
        textAlign: 'center',
        marginTop: Spacing.sm,
    },
    timerRow: {
        marginBottom: Spacing.sm,
    },
    timerText: {
        fontSize: Typography.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    timerCount: {
        color: Colors.primary,
        fontWeight: Typography.semibold,
    },
    timerExpired: {
        fontSize: Typography.sm,
        color: Colors.error,
        textAlign: 'center',
    },
    resendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    resendLabel: {
        fontSize: Typography.sm,
        color: Colors.textSecondary,
    },
    resendBtn: {
        fontSize: Typography.sm,
        color: Colors.primary,
        fontWeight: Typography.semibold,
    },
    resendDisabled: {
        color: Colors.textTertiary,
    },
    progressDots: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: Spacing.lg,
    },
    progressDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.border,
        borderWidth: 1.5,
        borderColor: Colors.border,
    },
    progressDotFilled: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    spacer: { flex: 1, minHeight: Spacing.xl },
    verifyBtn: {
        width: '100%',
        marginBottom: Spacing.md,
    },
    changeRow: {
        paddingVertical: Spacing.xs,
    },
    changeText: {
        fontSize: Typography.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    changeLink: {
        color: Colors.primary,
        fontWeight: Typography.medium,
    },
});

export default OTPVerificationScreen;
