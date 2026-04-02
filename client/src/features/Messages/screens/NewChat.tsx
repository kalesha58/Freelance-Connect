import React from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    Image,
    StatusBar,
    Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import { useColors } from "@/hooks/useColors";

const MOCK_CONTACTS = [
    { id: "1", name: "Sarah Chen", role: "UI Designer", avatar: "https://i.pravatar.cc/150?u=sarah" },
    { id: "2", name: "Marcus Johnson", role: "Full Stack Developer", avatar: "https://i.pravatar.cc/150?u=marcus" },
    { id: "3", name: "Alex Rivera", role: "Product Manager", avatar: "https://i.pravatar.cc/150?u=alex" },
    { id: "4", name: "Elena Gilbert", role: "UX Researcher", avatar: "https://i.pravatar.cc/150?u=elena" },
    { id: "5", name: "David Miller", role: "Backend Engineer", avatar: "https://i.pravatar.cc/150?u=david" },
];

export default function NewChat() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();

    const topInsetOffset = Platform.OS === "ios" ? insets.top : 20;

    return (
        <View style={[styles.root, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="dark-content" />

            <View style={[styles.header, { paddingTop: topInsetOffset + 10, borderBottomColor: colors.border }]}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Feather name="arrow-left" size={24} color={colors.foreground} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.foreground }]}>New Message</Text>
                    <View style={{ width: 40 }} />
                </View>
            </View>

            <FlatList
                data={MOCK_CONTACTS}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.contactItem, { borderBottomColor: colors.border + "40" }]}
                        onPress={() => navigation.navigate("Chat", { id: item.id })}
                    >
                        <Image source={{ uri: item.avatar }} style={styles.avatar} />
                        <View style={styles.contactInfo}>
                            <Text style={[styles.contactName, { color: colors.foreground }]}>{item.name}</Text>
                            <Text style={[styles.contactRole, { color: colors.mutedForeground }]}>{item.role}</Text>
                        </View>
                        <Feather name="plus-circle" size={20} color={colors.primary} />
                    </TouchableOpacity>
                )}
                ListHeaderComponent={() => (
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Suggested Contacts</Text>
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 40 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    header: { paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1 },
    headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    headerTitle: { fontSize: 18, fontWeight: "700" },
    contactItem: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1 },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
    contactInfo: { flex: 1 },
    contactName: { fontSize: 16, fontWeight: "600", marginBottom: 2 },
    contactRole: { fontSize: 13, fontWeight: "400" },
    sectionHeader: { padding: 16, paddingTop: 20 },
    sectionTitle: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
});
