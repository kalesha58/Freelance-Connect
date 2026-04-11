import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Typography, Spacing, BorderRadius } from '../theme';
import { useColors } from '../hooks/useColors';

interface Props {
    currentStep: number;
    totalSteps: number;
    showLabel?: boolean;
}

const ProgressBar: React.FC<Props> = ({
    currentStep,
    totalSteps,
    showLabel = true,
}) => {
    const colors = useColors();
    const progress = (currentStep / totalSteps) * 100;

    return (
        <View style={styles.container}>
            {showLabel && (
                <View style={styles.header}>
                    <Text style={[styles.label, { color: colors.mutedForeground }]}>
                        Step {currentStep} of {totalSteps}
                    </Text>
                    <Text style={[styles.percentage, { color: colors.primary }]}>
                        {Math.round(progress)}%
                    </Text>
                </View>
            )}

            <View style={[styles.track, { backgroundColor: colors.border }]}>
                <View
                    style={[
                        styles.fill,
                        { width: `${progress}%`, backgroundColor: colors.primary },
                    ]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: Spacing.xl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: Spacing.sm,
    },
    label: {
        fontSize: Typography.xs,
        fontWeight: Typography.semibold,
    },
    percentage: {
        fontSize: Typography.xs,
        fontWeight: Typography.bold,
    },
    track: {
        height: 6,
        borderRadius: BorderRadius.xs,
        width: '100%',
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: BorderRadius.xs,
    },
});

export default ProgressBar;
