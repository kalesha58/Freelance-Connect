import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    StatusBar,
    Platform,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../theme';

interface Props {
    title?: string;
    onBack?: () => void;
    rightElement?: React.ReactNode;
    backgroundColor?: string;
    tintColor?: string;
}

const Header: React.FC<Props> = ({
    title,
    onBack,
    rightElement,
    backgroundColor = Colors.primary,
    tintColor = Colors.white,
}) => {
    const insets = useSafeAreaInsets();
    const isIOS = Platform.OS === 'ios';

    return (
        <View style={[
            styles.container,
            {
                backgroundColor,
                paddingTop: isIOS ? insets.top : 0,
            }
        ]}>
            <StatusBar barStyle="light-content" backgroundColor={backgroundColor} translucent={false} />

            <View style={[styles.header, { height: 56 }]}>
                <View style={styles.left}>
                    {onBack && (
                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={onBack}
                            activeOpacity={0.7}
                        >
                            <Feather name="arrow-left" size={24} color={tintColor} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.center}>
                    {title && (
                        <Text
                            numberOfLines={1}
                            style={[styles.title, { color: tintColor }]}
                        >
                            {title}
                        </Text>
                    )}
                </View>

                <View style={styles.right}>
                    {rightElement || <View style={{ width: 40 }} />}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        zIndex: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
    },
    left: {
        flex: 1.5,
        alignItems: 'flex-start',
    },
    center: {
        flex: 4,
        alignItems: 'center',
    },
    right: {
        flex: 2,
        alignItems: 'flex-end',
    },
    backBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: Typography.base,
        fontWeight: Typography.bold,
        textAlign: 'center',
    },
});

export default Header;
