import React from "react";
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";

import { useColors } from "@/hooks/useColors";
import type { RootStackParamList } from "@/navigation/types";

type Props = RouteProp<RootStackParamList, "PortfolioWebView">;

/**
 * In-app browser for portfolio and external profile links (WebView).
 */
export default function PortfolioWebViewScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const route = useRoute<Props>();
    const { url, title } = route.params || { url: "", title: "Portfolio" };

    const topPad = Platform.OS === "ios" ? insets.top : 12;

    return (
        <View style={[styles.root, { backgroundColor: colors.background }]}>
            <View
                style={[
                    styles.toolbar,
                    {
                        paddingTop: topPad + 8,
                        paddingBottom: 12,
                        borderBottomColor: colors.border,
                        backgroundColor: colors.card,
                    },
                ]}
            >
                <TouchableOpacity
                    style={[styles.iconBtn, { borderColor: colors.border }]}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <Feather name="x" size={22} color={colors.foreground} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
                    {title || "Portfolio"}
                </Text>
                <View style={{ width: 40 }} />
            </View>
            {url ? (
                <WebView
                    source={{ uri: url }}
                    style={styles.webview}
                    startInLoadingState
                    renderLoading={() => (
                        <View style={[styles.loading, { backgroundColor: colors.background }]}>
                            <ActivityIndicator size="large" color={colors.primary} />
                        </View>
                    )}
                />
            ) : (
                <View style={styles.loading}>
                    <Text style={{ color: colors.mutedForeground }}>Invalid link</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    toolbar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        borderBottomWidth: 1,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    title: { flex: 1, textAlign: "center", fontSize: 16, fontWeight: "600", marginHorizontal: 8 },
    webview: { flex: 1 },
    loading: { flex: 1, alignItems: "center", justifyContent: "center" },
});
