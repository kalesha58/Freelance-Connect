import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';

interface Props {
    title: string;
    icon: string;
    onPress: () => void;
    style?: ViewStyle | ViewStyle[];
}

const SocialButton: React.FC<Props> = ({
    title,
    icon,
    onPress,
    style,
}) => {
    return (
        <TouchableOpacity
            style={[styles.button, { backgroundColor: '#fff', borderColor: Colors.border }, style]}
            onPress={onPress}
            activeOpacity={0.75}
        >
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>{icon}</Text>
            </View>
            <Text style={[styles.text, { color: Colors.foreground }]}>{title}</Text>
            <View style={{ width: 24 }} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 52,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.base,
        justifyContent: 'space-between',
        width: '100%',
    },
    iconContainer: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: 18,
    },
    text: {
        fontSize: Typography.base,
        fontWeight: Typography.bold,
    },
});

export default SocialButton;
