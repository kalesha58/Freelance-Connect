import React, { useRef, useState } from 'react';
import {
    StyleSheet,
    TextInput,
    View,
    TextInputKeyPressEventData,
    NativeSyntheticEvent,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';

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
                        styles.input,
                        value[i] !== '' && styles.active,
                        error && styles.error,
                        { borderColor: error ? Colors.destructive : Colors.border },
                    ]}
                    maxLength={1}
                    keyboardType="number-pad"
                    onChangeText={(text) => handleChangeText(text, i)}
                    onKeyPress={(e) => handleKeyPress(e, i)}
                    value={value[i]}
                    textAlign="center"
                    selectionColor={Colors.primary}
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
        backgroundColor: Colors.muted,
        color: Colors.foreground,
    },
    active: {
        borderColor: Colors.primary,
        backgroundColor: '#fff',
    },
    error: {
        backgroundColor: '#FEF2F2',
    },
});

export default OTPInput;
