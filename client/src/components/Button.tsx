import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import { Typography, Spacing, BorderRadius } from '../theme';
import { useColors } from '../hooks/useColors';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';

interface Props {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle | ViewStyle[];
}

const Button: React.FC<Props> = ({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    style,
}) => {
    const colors = useColors();
    const isPrimary = variant === 'primary';
    const isOutline = variant === 'outline';
    const isDestructive = variant === 'destructive';

    return (
        <TouchableOpacity
            style={[
                styles.button,
                isPrimary && { backgroundColor: colors.buttonPrimary },
                isOutline && { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
                isDestructive && { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FECACA' },
                disabled && { opacity: 0.5 },
                style,
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={isPrimary ? colors.onButtonPrimary : colors.primary} size="small" />
            ) : (
                <Text
                    style={[
                        styles.text,
                        isPrimary && { color: colors.onButtonPrimary },
                        isOutline && { color: colors.primary },
                        isDestructive && { color: colors.destructive },
                    ]}
                >
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 52,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
    },
    text: {
        fontSize: Typography.base,
        fontWeight: Typography.semibold,
    },
});

export default Button;
