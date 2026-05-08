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

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { StatusBar, ActivityIndicator } from "react-native";

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
    const { jobs, searchFreelancers, searchJobs } = useApp();
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
    const [freelancers, setFreelancers] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    React.useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredJobs([]);
            setFreelancers([]);
            return;
        }

        // Debounced search for both jobs and freelancers
        const timeout = setTimeout(async () => {
            setIsSearching(true);
            try {
                const [jobResults, freelancerResults] = await Promise.all([
                    searchJobs(searchQuery),
                    searchFreelancers(searchQuery)
                ]);
                setFilteredJobs(jobResults || []);
                setFreelancers(freelancerResults || []);
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [searchQuery, searchFreelancers, searchJobs]);

    const handleCategoryPress = async (category: string) => {
        setSearchQuery(category);
        setIsSearching(true);
        try {
            const results = await searchJobs(undefined, category);
            setFilteredJobs(results || []);
            setFreelancers([]); // Clear freelancers when searching by job category
        } catch (err) {
            console.error("Category search error:", err);
        } finally {
            setIsSearching(false);
        }
    };

    const topInsetOffset = Platform.OS === "ios" ? insets.top : 20;

    return (
        <View style={[styles.searchRoot, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor={colors.headerBackground} />
            <View style={[styles.searchHeaderBar, { backgroundColor: colors.headerBackground, paddingTop: topInsetOffset + 6 }]}>
                <View style={[styles.searchBarSurface, { backgroundColor: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.2)" }]}>
                    <Feather name="search" size={18} color="#fff" />
                    <TextInput
                        style={[styles.searchInputField, { color: "#fff" }]}
                        placeholder="Search jobs, skills, freelancers..."
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery("")}>
                            <Feather name="x-circle" size={16} color="#fff" />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={[styles.cancelActionLabel, { color: "#fff" }]}>Cancel</Text>
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
                                                onPress={() => handleCategoryPress(cat.label)}
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
                                {filteredJobs.length > 0 && (
                                    <View style={{ marginBottom: 24 }}>
                                        <Text style={[styles.sectionTitleLabel, { color: colors.foreground, marginBottom: 12 }]}>Jobs</Text>
                                        {filteredJobs.map(job => (
                                            <TouchableOpacity 
                                                key={job._id || job.id} 
                                                style={[styles.resultRow, { borderBottomColor: colors.border }]}
                                                onPress={() => navigation.navigate("JobDetail", { jobId: job._id || job.id })}
                                            >
                                                <View style={[styles.resultIcon, { backgroundColor: colors.blueLight }]}>
                                                    <Feather name="briefcase" size={16} color={colors.primary} />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[styles.resultTitle, { color: colors.foreground }]}>{job.title}</Text>
                                                    <Text style={[styles.resultSub, { color: colors.mutedForeground }]}>{job.clientName} • {job.budget}</Text>
                                                </View>
                                                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}

                                {freelancers.length > 0 && (
                                    <View style={{ marginBottom: 24 }}>
                                        <Text style={[styles.sectionTitleLabel, { color: colors.foreground, marginBottom: 12 }]}>Freelancers</Text>
                                        {freelancers.map(free => (
                                            <TouchableOpacity 
                                                key={free._id} 
                                                style={[styles.resultRow, { borderBottomColor: colors.border }]}
                                                onPress={() => navigation.navigate("UserProfile", { userId: free._id })}
                                            >
                                                <View style={[styles.resultIcon, { backgroundColor: colors.purpleAccent + "15" }]}>
                                                    <Feather name="user" size={16} color={colors.purpleAccent} />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[styles.resultTitle, { color: colors.foreground }]}>{free.name}</Text>
                                                    <Text style={[styles.resultSub, { color: colors.mutedForeground }]}>{free.tagline || free.role}</Text>
                                                </View>
                                                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}

                                {filteredJobs.length === 0 && freelancers.length === 0 && !isSearching && (
                                    <View style={styles.emptyResultsPlaceholder}>
                                        <Feather name="search" size={40} color={colors.mutedForeground} />
                                        <Text style={[styles.emptyResultsTitle, { color: colors.foreground }]}>No results found</Text>
                                        <Text style={[styles.emptyResultsSub, { color: colors.mutedForeground }]}>We couldn't find any jobs or freelancers matching "{searchQuery}"</Text>
                                    </View>
                                )}

                                {isSearching && (
                                    <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                                        <ActivityIndicator color={colors.primary} />
                                    </View>
                                )}
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
    emptyResultsPlaceholder: { alignItems: "center", gap: 8, marginTop: 40 },
    emptyResultsTitle: { fontSize: 16, fontWeight: '700' },
    emptyResultsSub: { fontSize: 13, fontWeight: '400', textAlign: "center", paddingHorizontal: 20 },
    resultRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1 },
    resultIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    resultTitle: { fontSize: 15, fontWeight: '600' },
    resultSub: { fontSize: 13, fontWeight: '400', marginTop: 2 },
});
