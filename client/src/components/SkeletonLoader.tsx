import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions, Animated, Easing } from 'react-native';
import { useColors } from '@/hooks/useColors';

const { width } = Dimensions.get('window');

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: any;
}

export const SkeletonItem: React.FC<SkeletonProps> = ({ 
    width: w = '100%', 
    height: h = 20, 
    borderRadius = 4,
    style 
}) => {
    const colors = useColors();
    const animatedValue = new Animated.Value(0);

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                {
                    width: w as any,
                    height: h as any,
                    borderRadius,
                    backgroundColor: colors.muted,
                    opacity,
                },
                style,
            ]}
        />
    );
};

export const PostCardSkeleton = () => {
    const colors = useColors();
    return (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.header}>
                <SkeletonItem width={40} height={40} borderRadius={20} />
                <View style={styles.headerText}>
                    <SkeletonItem width={120} height={14} style={{ marginBottom: 6 }} />
                    <SkeletonItem width={80} height={10} />
                </View>
            </View>
            <SkeletonItem width="100%" height={width} borderRadius={0} style={{ marginVertical: 12 }} />
            <View style={styles.footer}>
                <View style={styles.actions}>
                    <SkeletonItem width={24} height={24} borderRadius={12} />
                    <SkeletonItem width={24} height={24} borderRadius={12} />
                    <SkeletonItem width={24} height={24} borderRadius={12} />
                </View>
                <SkeletonItem width={60} height={14} style={{ marginTop: 12 }} />
                <SkeletonItem width="90%" height={12} style={{ marginTop: 8 }} />
                <SkeletonItem width="60%" height={12} style={{ marginTop: 6 }} />
            </View>
        </View>
    );
};

export const JobCardSkeleton = () => {
    const colors = useColors();
    return (
        <View style={[styles.jobCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.jobHeader}>
                <View style={styles.jobHeaderText}>
                    <SkeletonItem width="70%" height={18} style={{ marginBottom: 8 }} />
                    <SkeletonItem width="40%" height={12} />
                </View>
                <SkeletonItem width={24} height={24} borderRadius={4} />
            </View>
            <View style={styles.jobMeta}>
                <SkeletonItem width={100} height={12} />
                <SkeletonItem width={80} height={12} />
            </View>
            <View style={styles.jobSkills}>
                <SkeletonItem width={60} height={24} borderRadius={12} />
                <SkeletonItem width={80} height={24} borderRadius={12} />
                <SkeletonItem width={70} height={24} borderRadius={12} />
            </View>
            <View style={styles.jobFooter}>
                <SkeletonItem width={120} height={14} />
                <SkeletonItem width={100} height={14} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 10,
    },
    headerText: {
        flex: 1,
    },
    footer: {
        paddingHorizontal: 12,
    },
    actions: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 4,
    },
    jobCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
    },
    jobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    jobHeaderText: {
        flex: 1,
    },
    jobMeta: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    jobSkills: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    jobFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});
