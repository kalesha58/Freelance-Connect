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
import { Colors, Typography, Spacing, BorderRadius } from '../theme';

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
    secureTextEntry,
    onFocus,
    onBlur,
    style,
    ...rest
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

    const hasError = !!error;

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.focused,
                    hasError && styles.error,
                    { backgroundColor: Colors.muted },
                ]}
            >
                {leftIcon && (
                    <Feather
                        name={leftIcon}
                        size={18}
                        color={isFocused ? Colors.primary : Colors.mutedForeground}
                        style={styles.leftIcon}
                    />
                )}

                <TextInput
                    style={[styles.input, { color: Colors.foreground }]}
                    onFocus={(e) => {
                        setIsFocused(true);
                        onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        onBlur?.(e);
                    }}
                    secureTextEntry={isPassword && !isPasswordVisible}
                    placeholderTextColor={Colors.mutedForeground}
                    selectionColor={Colors.primary}
                    {...rest}
                />

                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        activeOpacity={0.7}
                    >
                        <Feather
                            name={isPasswordVisible ? 'eye-off' : 'eye'}
                            size={18}
                            color={Colors.mutedForeground}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {hasError && <Text style={styles.errorText}>{error}</Text>}
            {hint && !hasError && <Text style={styles.hintText}>{hint}</Text>}
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
        color: Colors.foreground,
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
    focused: {
        borderColor: Colors.primary,
        backgroundColor: '#fff',
    },
    error: {
        borderColor: Colors.destructive,
        backgroundColor: '#FEF2F2',
    },
    errorText: {
        fontSize: Typography.xs,
        color: Colors.destructive,
        marginTop: 4,
    },
    hintText: {
        fontSize: Typography.xs,
        color: Colors.mutedForeground,
        marginTop: 4,
    },
    leftIcon: {
        marginRight: Spacing.sm,
    },
});

export default Input;
