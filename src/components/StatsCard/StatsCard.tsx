import React, { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

/**
 * Properties for the StatsCard component.
 */
export interface IStatsCardProps {
    label: string;
    value: string;
    sub?: string;
    color?: string;
    icon: ReactNode;
}

/**
 * A consistent card for displaying numerical statistics or metrics.
 * Designed to show key data points with an associated icon and optional secondary label.
 */
export function StatsCard({ label, value, sub, color, icon }: IStatsCardProps) {
    const colors = useColors();
    const highlightColorValue = color || colors.primary;

    return (
        <View style={[styles.statsCardSurface, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statsIconWrapper, { backgroundColor: highlightColorValue + "15" }]}>
                {icon}
            </View>
            <Text style={[styles.mainMetricValue, { color: colors.foreground }]}>{value}</Text>
            <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>{label}</Text>
            {sub && <Text style={[styles.secondaryMetricLabel, { color: highlightColorValue }]}>{sub}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    statsCardSurface: {
        flex: 1,
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    statsIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    mainMetricValue: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 2,
    },
    metricLabel: {
        fontSize: 11,
        fontWeight: '500',
        marginBottom: 2,
    },
    secondaryMetricLabel: {
        fontSize: 10,
        fontWeight: '600',
    },
});
