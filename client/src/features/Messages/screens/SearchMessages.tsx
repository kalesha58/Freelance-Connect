import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    FlatList,
    StatusBar,
    Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useColors } from "@/hooks/useColors";

export default function SearchMessages() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const [searchQuery, setSearchQuery] = useState("");

    const topInsetOffset = Platform.OS === "ios" ? insets.top : 20;

    return (
        <View style={[styles.root, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="dark-content" />

            <View style={[styles.header, { paddingTop: topInsetOffset + 10 }]}>
                <View style={styles.searchContainer}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Feather name="arrow-left" size={24} color={colors.foreground} />
                    </TouchableOpacity>
                    <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Feather name="search" size={18} color={colors.mutedForeground} />
                        <TextInput
                            style={[styles.input, { color: colors.foreground }]}
                            placeholder="Search messages..."
                            placeholderTextColor={colors.mutedForeground}
                            autoFocus
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery("")}>
                                <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            <View style={styles.emptyContainer}>
                <View style={[styles.emptyIconBox, { backgroundColor: colors.blueLight }]}>
                    <Feather name="message-square" size={32} color={colors.primary} />
                </View>
                {searchQuery.length > 0 ? (
                    <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                        No messages found for "{searchQuery}"
                    </Text>
                ) : (
                    <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                        Search your chats, contacts, or message history.
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    header: { paddingHorizontal: 16, paddingBottom: 16 },
    searchContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
    backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    inputWrapper: { flex: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, height: 48, gap: 8 },
    input: { flex: 1, fontSize: 16, padding: 0 },
    emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 },
    emptyIconBox: { width: 70, height: 70, borderRadius: 35, alignItems: "center", justifyContent: "center", marginBottom: 20 },
    emptyText: { fontSize: 15, fontWeight: "500", textAlign: "center", lineHeight: 22 },
});
