import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Animated,
    Dimensions,
    StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '@/navigation/types';
import Button from '@/components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '@/theme';

const { width } = Dimensions.get('window');

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

interface Slide {
    id: string;
    emoji: string;
    emojiBackground: string;
    title: string;
    description: string;
}

const slides: Slide[] = [
    {
        id: '1',
        emoji: '🧑💼',
        emojiBackground: '#EEF2FF',
        title: 'Hire Skilled Professionals',
        description:
            'Find trusted freelancers for any job quickly and securely. Browse profiles, reviews, and portfolios.',
    },
    {
        id: '2',
        emoji: '💼',
        emojiBackground: '#F0FDF4',
        title: 'Earn as a Freelancer',
        description:
            'Showcase your skills and get paid what you\'re worth. Set your own rates and work on your schedule.',
    },
    {
        id: '3',
        emoji: '💬',
        emojiBackground: '#FFF7ED',
        title: 'Fast & Easy Communication',
        description:
            'Chat, collaborate, and complete work seamlessly. Built-in tools for smooth project management.',
    },
];

const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const scrollX = useRef(new Animated.Value(0)).current;

    const handleNext = async () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            await AsyncStorage.setItem('seen_onboarding', 'true');
            navigation.navigate('Signup', { role: 'freelancer' });
        }
    };

    const handleSkip = async () => {
        await AsyncStorage.setItem('seen_onboarding', 'true');
        navigation.navigate('Signup', { role: 'freelancer' });
    };

    const renderSlide = ({ item }: { item: Slide }) => (
        <View style={styles.slide}>
            <View style={[styles.illustrationBox, { backgroundColor: item.emojiBackground }]}>
                <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

            <View style={styles.skipRow}>
                <TouchableOpacity onPress={handleSkip}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            </View>

            <Animated.FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderSlide}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(index);
                }}
                style={styles.flatList}
            />

            <View style={styles.footer}>
                {/* Dot indicators */}
                <View style={styles.dotRow}>
                    {slides.map((_, i) => {
                        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [8, 24, 8],
                            extrapolate: 'clamp',
                        });
                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });

                        return (
                            <Animated.View
                                key={i}
                                style={[styles.dot, { width: dotWidth, opacity }]}
                            />
                        );
                    })}
                </View>

                <Button
                    title={currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
                    onPress={handleNext}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.surface,
    },
    skipRow: {
        paddingTop: Spacing.xl,
        paddingHorizontal: Spacing.xl,
        alignItems: 'flex-end',
    },
    skipText: {
        fontSize: Typography.base,
        color: Colors.primary,
        fontWeight: Typography.medium,
    },
    flatList: {
        flex: 1,
    },
    slide: {
        width,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
    },
    illustrationBox: {
        width: 200,
        height: 200,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing['2xl'],
    },
    emoji: {
        fontSize: 80,
    },
    title: {
        fontSize: Typography['2xl'],
        fontWeight: Typography.bold,
        color: Colors.text,
        textAlign: 'center',
        marginBottom: Spacing.md,
        lineHeight: Typography['2xl'] * Typography.tight,
    },
    description: {
        fontSize: Typography.base,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: Typography.base * Typography.relaxed,
        paddingHorizontal: Spacing.md,
    },
    footer: {
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing['3xl'],
        gap: Spacing.lg,
    },
    dotRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
    },
});

export default OnboardingScreen;
