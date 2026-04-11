import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Typography, Spacing, BorderRadius } from '../theme';
import { useColors } from '../hooks/useColors';

interface Props extends TextInputProps {
    label?: string;
    error?: string;
    hint?: string;
    isPassword?: boolean;
    leftIcon?: string;
}

const Input: React.FC<Props> = ({
    label,
    error,
    hint,
    isPassword,
    leftIcon,
    onFocus,
    onBlur,
    style,
    ...rest
}) => {
    const colors = useColors();
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const hasError = !!error;

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>}

            <View
                style={[
                    styles.inputContainer,
                    hasError
                        ? { borderColor: colors.destructive, backgroundColor: colors.muted }
                        : isFocused
                            ? { borderColor: colors.primary, backgroundColor: colors.card }
                            : { borderColor: 'transparent', backgroundColor: colors.muted },
                ]}
            >
                {leftIcon && (
                    <Feather
                        name={leftIcon}
                        size={18}
                        color={isFocused ? colors.primary : colors.mutedForeground}
                        style={styles.leftIcon}
                    />
                )}

                <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    onFocus={(e) => {
                        setIsFocused(true);
                        onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        onBlur?.(e);
                    }}
                    secureTextEntry={isPassword && !isPasswordVisible}
                    placeholderTextColor={colors.mutedForeground}
                    selectionColor={colors.primary}
                    {...rest}
                />

                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        activeOpacity={0.7}
                    >
                        <Feather
                            name={isPasswordVisible ? 'eye' : 'eye-off'}
                            size={18}
                            color={colors.mutedForeground}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {hasError && <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>}
            {hint && !hasError && <Text style={[styles.hintText, { color: colors.mutedForeground }]}>{hint}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.lg,
        width: '100%',
    },
    label: {
        fontSize: Typography.sm,
        fontWeight: Typography.semibold,
        marginBottom: Spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.base,
        height: 52,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    input: {
        flex: 1,
        fontSize: Typography.base,
        height: '100%',
    },
    errorText: {
        fontSize: Typography.xs,
        marginTop: 4,
    },
    hintText: {
        fontSize: Typography.xs,
        marginTop: 4,
    },
    leftIcon: {
        marginRight: Spacing.sm,
    },
});

export default Input;
