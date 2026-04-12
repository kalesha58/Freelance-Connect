import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    StatusBar,
    Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '@/navigation/types';
import { Typography, Spacing } from '@/theme';
import { useColors } from '@/hooks/useColors';

const { width, height } = Dimensions.get('window');

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

const SplashScreen: React.FC<Props> = ({ navigation }) => {
    const colors = useColors();
    const logoScale = useRef(new Animated.Value(0.3)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const taglineOpacity = useRef(new Animated.Value(0)).current;
    const dotOpacities = [
        useRef(new Animated.Value(0.3)).current,
        useRef(new Animated.Value(0.3)).current,
        useRef(new Animated.Value(0.3)).current,
    ];

    useEffect(() => {
        // Logo entrance animation
        Animated.sequence([
            Animated.parallel([
                Animated.spring(logoScale, {
                    toValue: 1,
                    tension: 60,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(textOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(taglineOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();

        // Pulsing dots animation
        const pulseLoop = () => {
            Animated.stagger(200,
                dotOpacities.map((dot) =>
                    Animated.sequence([
                        Animated.timing(dot, {
                            toValue: 1,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                        Animated.timing(dot, {
                            toValue: 0.3,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                    ])
                )
            ).start(() => pulseLoop());
        };
        pulseLoop();

        // Wait for AppContext to potentially load the user
        const timer = setTimeout(async () => {
            try {
                const token = await AsyncStorage.getItem('tasker_token');
                const seenOnboarding = await AsyncStorage.getItem('seen_onboarding');

                // If user is null but token exists, loadUser in AppContext is likely running.
                // If user is set, RootNavigator will automatically swap stacks.
                // We only need to handle Onboarding/Login navigation here if NO user is found.
                if (!token) {
                    if (seenOnboarding) {
                        navigation.replace('Login');
                    } else {
                        navigation.replace('Onboarding');
                    }
                }
                // If token exists, we just stay on Splash until RootNavigator swaps the stack
            } catch {
                navigation.replace('Onboarding');
            }
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.primary }]}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <Animated.View
                style={[
                    styles.logoBox,
                    { transform: [{ scale: logoScale }], opacity: logoOpacity },
                ]}
            >
                {/* Skill Link "S" icon */}
                <View style={styles.logoLines}>
                    <View style={[styles.line, styles.lineTop]} />
                    <View style={[styles.line, styles.lineMid]} />
                    <View style={[styles.line, styles.lineBottom]} />
                </View>
            </Animated.View>

            <Animated.Text style={[styles.appName, { opacity: textOpacity, color: colors.white }]}>
                Skill Link
            </Animated.Text>

            <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
                Connect. Work. Grow.
            </Animated.Text>

            <View style={styles.dots}>
                {dotOpacities.map((opacity, i) => (
                    <Animated.View key={i} style={[styles.dot, { opacity }]} />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoBox: {
        width: 88,
        height: 88,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    logoLines: {
        gap: 6,
        alignItems: 'flex-start',
    },
    line: {
        height: 4,
        backgroundColor: '#fff',
        borderRadius: 2,
    },
    lineTop: { width: 36 },
    lineMid: { width: 26 },
    lineBottom: { width: 32 },
    appName: {
        fontSize: Typography['4xl'],
        fontWeight: Typography.extrabold,
        letterSpacing: -0.5,
    },
    tagline: {
        fontSize: Typography.base,
        color: 'rgba(255,255,255,0.7)',
        marginTop: Spacing.sm,
    },
    dots: {
        flexDirection: 'row',
        gap: 6,
        marginTop: Spacing['4xl'],
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.7)',
    },
});

export default SplashScreen;
