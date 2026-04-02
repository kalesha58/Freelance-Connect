import React, { useState } from "react";
import {
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RNRestart from "react-native-restart";
import Feather from "react-native-vector-icons/Feather";

import { useColors } from "@/hooks/useColors";

/**
 * Interface defining properties for the ErrorFallback UI component.
 */
export interface IErrorFallbackProps {
    error: Error;
    resetError: () => void;
}

/**
 * Displayed when an unhandled error is caught by the ErrorBoundary.
 * Replaces expo and expo icons with native React Native CLI alternatives.
 */
export function ErrorFallback({ error, resetError }: IErrorFallbackProps) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const [isModalOpen, setIsModalOpen] = useState(false);

    /**
     * Triggers a full application restart using react-native-restart.
     */
    const handleRestartAttempt = () => {
        try {
            RNRestart.Restart();
        } catch (restartFailure) {
            // Logic for fallback when restart mechanism itself fails
            resetError();
        }
    };

    /**
     * Helper formatting for error message and stack trace.
     */
    const formatErrorDetailString = (): string => {
        let detailString = `Error: ${error.message}\n\n`;
        if (error.stack) {
            detailString += `Stack Trace:\n${error.stack}`;
        }
        return detailString;
    };

    const monospaceFontFamily = Platform.select({
        ios: "Menlo",
        android: "monospace",
        default: "monospace",
    });

    return (
        <View style={[styles.mainView, { backgroundColor: colors.background }]}>
            {__DEV__ ? (
                <Pressable
                    onPress={() => setIsModalOpen(true)}
                    accessibilityLabel="View error details"
                    accessibilityRole="button"
                    style={({ pressed }) => [
                        styles.detailsToggle,
                        {
                            top: insets.top + 16,
                            backgroundColor: colors.card,
                            opacity: pressed ? 0.8 : 1,
                        },
                    ]}
                >
                    <Feather name="alert-circle" size={20} color={colors.foreground} />
                </Pressable>
            ) : null}

            <View style={styles.errorInfoSection}>
                <Text style={[styles.errorTitle, { color: colors.foreground }]}>
                    Something went wrong
                </Text>

                <Text style={[styles.errorSubCopy, { color: colors.mutedForeground }]}>
                    Please reload the app to continue.
                </Text>

                <Pressable
                    onPress={handleRestartAttempt}
                    style={({ pressed }) => [
                        styles.primaryAction,
                        {
                            backgroundColor: colors.primary,
                            opacity: pressed ? 0.9 : 1,
                            transform: [{ scale: pressed ? 0.98 : 1 }],
                        },
                    ]}
                >
                    <Text style={styles.actionLabel}>Try Again</Text>
                </Pressable>
            </View>

            {__DEV__ ? (
                <Modal
                    visible={isModalOpen}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setIsModalOpen(false)}
                >
                    <View style={styles.modalBackdrop}>
                        <View
                            style={[
                                styles.modalSurface,
                                { backgroundColor: colors.background },
                            ]}
                        >
                            <View
                                style={[
                                    styles.modalHeadRow,
                                    { borderBottomColor: colors.border },
                                ]}
                            >
                                <Text style={[styles.modalHeading, { color: colors.foreground }]}>
                                    Error Details
                                </Text>
                                <Pressable
                                    onPress={() => setIsModalOpen(false)}
                                    accessibilityLabel="Close error details"
                                    accessibilityRole="button"
                                    style={({ pressed }) => [
                                        styles.modalCloseBtn,
                                        { opacity: pressed ? 0.6 : 1 },
                                    ]}
                                >
                                    <Feather name="x" size={24} color={colors.foreground} />
                                </Pressable>
                            </View>

                            <ScrollView
                                style={styles.modalScrollArea}
                                contentContainerStyle={[
                                    styles.modalContentPadding,
                                    { paddingBottom: insets.bottom + 16 },
                                ]}
                                showsVerticalScrollIndicator
                            >
                                <View
                                    style={[
                                        styles.errorTraceBox,
                                        { backgroundColor: colors.card },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.traceContentText,
                                            {
                                                color: colors.foreground,
                                                fontFamily: monospaceFontFamily,
                                            },
                                        ]}
                                        selectable
                                    >
                                        {formatErrorDetailString()}
                                    </Text>
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    errorInfoSection: {
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        width: "100%",
        maxWidth: 600,
    },
    errorTitle: {
        fontSize: 28,
        fontWeight: "700",
        textAlign: "center",
        lineHeight: 40,
    },
    errorSubCopy: {
        fontSize: 16,
        textAlign: "center",
        lineHeight: 24,
    },
    detailsToggle: {
        position: "absolute",
        right: 16,
        width: 44,
        height: 44,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
    },
    primaryAction: {
        paddingVertical: 16,
        borderRadius: 8,
        paddingHorizontal: 24,
        minWidth: 200,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionLabel: {
        color: '#fff',
        fontWeight: "600",
        textAlign: "center",
        fontSize: 16,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalSurface: {
        width: "100%",
        height: "90%",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    modalHeadRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    modalHeading: {
        fontSize: 20,
        fontWeight: "600",
    },
    modalCloseBtn: {
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
    },
    modalScrollArea: {
        flex: 1,
    },
    modalContentPadding: {
        padding: 16,
    },
    errorTraceBox: {
        width: "100%",
        borderRadius: 8,
        overflow: "hidden",
        padding: 16,
    },
    traceContentText: {
        fontSize: 12,
        lineHeight: 18,
        width: "100%",
    },
});
