import React, { useState } from "react";
import {
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";

import { useColors } from "@/hooks/useColors";

const RECENT_SEARCHES = ["React Native Developer", "UI/UX Designer", "Python freelancer", "Brand identity"];

const CATEGORIES = [
    { label: "Mobile Development", icon: "smartphone", count: "284 jobs" },
    { label: "Web Development", icon: "monitor", count: "512 jobs" },
    { label: "Design", icon: "pen-tool", count: "198 jobs" },
    { label: "Data Science", icon: "bar-chart-2", count: "143 jobs" },
    { label: "Writing & Content", icon: "edit-3", count: "96 jobs" },
    { label: "Marketing", icon: "trending-up", count: "74 jobs" },
];

/**
 * SearchScreen provides a discovery hub for jobs and freelancers.
 * Includes recent searches and category browsing as fallback discovery points.
 */
export default function SearchScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const [searchQuery, setSearchQuery] = useState("");

    const topInsetOffset = Platform.OS === "ios" ? insets.top : 20;

    return (
        <View style={[styles.searchRoot, { backgroundColor: colors.background }]}>
            <View style={[styles.searchHeaderBar, { paddingTop: topInsetOffset + 6 }]}>
                <View style={[styles.searchBarSurface, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Feather name="search" size={18} color={colors.mutedForeground} />
                    <TextInput
                        style={[styles.searchInputField, { color: colors.foreground }]}
                        placeholder="Search jobs, skills, freelancers..."
                        placeholderTextColor={colors.mutedForeground}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery("")}>
                            <Feather name="x-circle" size={16} color={colors.mutedForeground} />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={[styles.cancelActionLabel, { color: colors.primary }]}>Cancel</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={[]}
                keyExtractor={() => "search_list"}
                renderItem={() => null}
                ListHeaderComponent={
                    <View style={styles.searchDashboardContent}>
                        {searchQuery.length === 0 ? (
                            <>
                                <View style={styles.searchSectionArea}>
                                    <View style={styles.sectionHeaderControl}>
                                        <Text style={[styles.sectionTitleLabel, { color: colors.foreground }]}>Recent Searches</Text>
                                        <TouchableOpacity>
                                            <Text style={[styles.clearHistoryAction, { color: colors.primary }]}>Clear all</Text>
                                        </TouchableOpacity>
                                    </View>
                                    {RECENT_SEARCHES.map(term => (
                                        <TouchableOpacity
                                            key={term}
                                            style={[styles.recentSearchRow, { borderBottomColor: colors.border }]}
                                            onPress={() => setSearchQuery(term)}
                                        >
                                            <Feather name="clock" size={16} color={colors.mutedForeground} />
                                            <Text style={[styles.recentSearchLabel, { color: colors.foreground }]}>{term}</Text>
                                            <Feather name="arrow-up-left" size={15} color={colors.mutedForeground} />
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <View style={styles.searchSectionArea}>
                                    <Text style={[styles.sectionTitleLabel, { color: colors.foreground }]}>Browse Categories</Text>
                                    <View style={styles.categoriesGridSurface}>
                                        {CATEGORIES.map(cat => (
                                            <TouchableOpacity
                                                key={cat.label}
                                                style={[styles.categoryActionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                                                activeOpacity={0.85}
                                            >
                                                <View style={[styles.categoryIconSurface, { backgroundColor: colors.blueLight }]}>
                                                    <Feather name={cat.icon as any} size={18} color={colors.primary} />
                                                </View>
                                                <Text style={[styles.categoryLabelText, { color: colors.foreground }]}>{cat.label}</Text>
                                                <Text style={[styles.categoryJobCountLabel, { color: colors.mutedForeground }]}>{cat.count}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </>
                        ) : (
                            <View style={styles.activeSearchResultsArea}>
                                <Text style={[styles.resultsContextLabel, { color: colors.mutedForeground }]}>
                                    Results for "{searchQuery}"
                                </Text>
                                <View style={styles.emptyResultsPlaceholder}>
                                    <Feather name="search" size={40} color={colors.mutedForeground} />
                                    <Text style={[styles.emptyResultsTitle, { color: colors.foreground }]}>Start typing to search</Text>
                                    <Text style={[styles.emptyResultsSub, { color: colors.mutedForeground }]}>We'll find the best matching jobs and freelancers for you</Text>
                                </View>
                            </View>
                        )}
                    </View>
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    searchRoot: { flex: 1 },
    searchHeaderBar: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 14 },
    searchBarSurface: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
    searchInputField: { flex: 1, fontSize: 15, fontWeight: '400' },
    cancelActionLabel: { fontSize: 14, fontWeight: '700' },
    searchDashboardContent: { paddingHorizontal: 16 },
    searchSectionArea: { marginBottom: 24 },
    sectionHeaderControl: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
    sectionTitleLabel: { fontSize: 17, fontWeight: '700' },
    clearHistoryAction: { fontSize: 13, fontWeight: '500' },
    recentSearchRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, borderBottomWidth: 1 },
    recentSearchLabel: { flex: 1, fontSize: 14, fontWeight: '400' },
    categoriesGridSurface: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    categoryActionCard: { width: "47%", borderRadius: 14, padding: 14, borderWidth: 1, gap: 6 },
    categoryIconSurface: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    categoryLabelText: { fontSize: 13, fontWeight: '600' },
    categoryJobCountLabel: { fontSize: 11, fontWeight: '400' },
    activeSearchResultsArea: { paddingTop: 20 },
    resultsContextLabel: { fontSize: 13, fontWeight: '400', marginBottom: 20 },
    emptyResultsPlaceholder: { alignItems: "center", gap: 8 },
    emptyResultsTitle: { fontSize: 16, fontWeight: '700' },
    emptyResultsSub: { fontSize: 13, fontWeight: '400', textAlign: "center" },
});
