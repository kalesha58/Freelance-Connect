import React, { useRef, useState } from 'react';
import {
    StyleSheet,
    TextInput,
    View,
    TextInputKeyPressEventData,
    NativeSyntheticEvent,
} from 'react-native';
import { Typography, Spacing, BorderRadius } from '../theme';
import { useColors } from '../hooks/useColors';

interface Props {
    length: number;
    value: string[];
    onChange: (value: string[]) => void;
    error?: boolean;
}

const OTPInput: React.FC<Props> = ({
    length,
    value,
    onChange,
    error,
}) => {
    const colors = useColors();
    const inputs = useRef<TextInput[]>([]);

    const handleChangeText = (text: string, index: number) => {
        const newValue = [...value];
        newValue[index] = text.slice(-1); // Only take the last character
        onChange(newValue);

        if (text && index < length - 1) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    return (
        <View style={styles.container}>
            {Array.from({ length }).map((_, i) => (
                <TextInput
                    key={i}
                    ref={(ref) => { if (ref) inputs.current[i] = ref; }}
                    style={[
                        {
                            borderColor: error ? colors.destructive : colors.border,
                            backgroundColor: colors.muted,
                            color: colors.foreground
                        },
                        value[i] !== '' && { borderColor: colors.primary, backgroundColor: colors.card },
                    ]}
                    maxLength={1}
                    keyboardType="number-pad"
                    onChangeText={(text) => handleChangeText(text, i)}
                    onKeyPress={(e) => handleKeyPress(e, i)}
                    value={value[i]}
                    textAlign="center"
                    selectionColor={colors.primary}
                    placeholderTextColor={colors.mutedForeground}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: Spacing.xs,
    },
    input: {
        width: 48,
        height: 56,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        fontSize: Typography.xl,
        fontWeight: Typography.bold,
    },
});

export default OTPInput;
