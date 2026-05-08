import React, { useState, useEffect } from "react";
import {
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { JobCard, IJob } from "@/components";

const SKILLS_FILTER = ["All", "React Native", "UI/UX Design", "Python", "Swift", "Branding"];

/**
 * MyJobsScreen mirrored from HomeScreen layout to show applied/posted jobs.
 */
export default function MyJobsScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { user, fetchMyPostings, fetchMyAppliedJobs, savedJobIds, jobs: allJobs } = useApp();
    
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<"applied" | "saved" | "posted">(user?.role === 'hirer' ? "posted" : "applied");
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");

    const fetchData = async () => {
        if (!refreshing) setLoading(true);
        try {
            if (activeTab === 'applied') {
                const results = await fetchMyAppliedJobs();
                setJobs(results || []);
            } else if (activeTab === 'saved') {
                const results = allJobs.filter(j => savedJobIds.includes(j._id || j.id));
                setJobs(results || []);
            } else {
                const results = await fetchMyPostings();
                setJobs(results || []);
            }
        } catch (error) {
            console.error("Fetch My Jobs Error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab, savedJobIds]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const topPaddingOffset = Platform.OS === "ios" ? insets.top : 20;

    const filteredJobs = jobs.filter(j => {
        const query = search.toLowerCase();
        const isSearchMatch = search === "" || 
            j.title?.toLowerCase().includes(query) || 
            j.description?.toLowerCase().includes(query);
            
        const isFilterMatch = activeFilter === "All" || 
            j.category?.toLowerCase().includes(activeFilter.toLowerCase()) ||
            (Array.isArray(j.skills) && j.skills.some((s: string) => s.toLowerCase() === activeFilter.toLowerCase()));
            
        return isSearchMatch && isFilterMatch;
    });

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <StatusBar barStyle="light-content" backgroundColor={colors.headerBackground} />
            <View style={[styles.headerSolid, { backgroundColor: colors.headerBackground, paddingTop: topPaddingOffset + 12, paddingBottom: 40 }]}>
                <View style={styles.titleBar}>
                    <View style={styles.userNameWrapper}>
                        <Text style={[styles.roleLabelText, { color: 'rgba(255,255,255,0.7)' }]}>Good morning,</Text>
                        <Text style={[styles.userNameText, { color: '#fff' }]} numberOfLines={1}>{user?.name ?? "Guest"}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.headerIconBtnSolid, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
                        onPress={() => navigation.navigate("Notifications")}
                    >
                        <Ionicons name="notifications-outline" size={22} color="#fff" />
                        <View style={styles.unreadNotifMarker} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.contentPadding}>
                <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Feather name="search" size={18} color={colors.mutedForeground} />
                    <TextInput
                        style={[styles.searchField, { color: colors.foreground }]}
                        placeholder="Search for your applied jobs..."
                        placeholderTextColor={colors.mutedForeground}
                        value={search}
                        onChangeText={setSearch}
                    />
                    <TouchableOpacity style={[styles.searchFilterBtn, { backgroundColor: colors.buttonPrimary }]}>
                        <Feather name="sliders" size={16} color={colors.onButtonPrimary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.quickMetricsRow}>
                    {[
                        { label: activeTab === 'applied' ? "Applied Jobs" : "Active Jobs", value: jobs.length, color: "#3b82f6", icon: "briefcase" },
                        { label: "New Leads", value: "+12", color: "#f59e0b", icon: "flash" },
                        { label: "Earnings", value: "₹4.1K", color: "#10b981", icon: "wallet" },
                    ].map(stat => (
                        <View key={stat.label} style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={[styles.metricIconBox, { backgroundColor: stat.color + "15" }]}>
                                <Ionicons name={stat.icon as any} size={14} color={stat.color} />
                            </View>
                            <Text style={[styles.metricValText, { color: colors.foreground }]}>{stat.value}</Text>
                            <Text style={[styles.metricLabelText, { color: colors.mutedForeground }]}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.tabSwitcher}>
                    <TouchableOpacity 
                        style={[styles.tabBtn, activeTab === 'applied' && { backgroundColor: colors.primary }]} 
                        onPress={() => setActiveTab('applied')}
                    >
                        <Text style={[styles.tabBtnText, { color: activeTab === 'applied' ? '#fff' : colors.foreground }]}>Applied</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tabBtn, activeTab === 'saved' && { backgroundColor: colors.primary }]} 
                        onPress={() => setActiveTab('saved')}
                    >
                        <Text style={[styles.tabBtnText, { color: activeTab === 'saved' ? '#fff' : colors.foreground }]}>Saved</Text>
                    </TouchableOpacity>
                    {user?.role === 'hirer' && (
                        <TouchableOpacity 
                            style={[styles.tabBtn, activeTab === 'posted' && { backgroundColor: colors.primary }]} 
                            onPress={() => setActiveTab('posted')}
                        >
                            <Text style={[styles.tabBtnText, { color: activeTab === 'posted' ? '#fff' : colors.foreground }]}>Postings</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <Text style={[styles.sectionHeading, { color: colors.foreground }]}>Filter by Expertise</Text>
                <FlatList
                    data={SKILLS_FILTER}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.categoryChip, {
                                backgroundColor: activeFilter === item ? colors.buttonPrimary : colors.card,
                                borderColor: activeFilter === item ? colors.buttonPrimary : colors.border,
                            }]}
                            onPress={() => setActiveFilter(item)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.categoryChipLabel, { color: activeFilter === item ? colors.onButtonPrimary : colors.foreground }]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.categoryListContent}
                />
                <View style={styles.resultsHeaderRow}>
                    <Text style={[styles.resultsLabel, { color: colors.foreground }]}>
                        {filteredJobs.length} Jobs Found For You
                    </Text>
                    <TouchableOpacity>
                        <Text style={[styles.sortText, { color: colors.primary }]}>Latest First</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={[styles.root, { backgroundColor: colors.background }]}>
            <FlatList
                data={filteredJobs}
                keyExtractor={(item) => item._id || item.id}
                ListHeaderComponent={renderHeader()}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} onRefresh={onRefresh} />
                }
                contentContainerStyle={{ paddingBottom: 100 }}
                renderItem={({ item }) => (
                    <View style={styles.jobItemWrapper}>
                        {activeTab === 'applied' && (
                            <TouchableOpacity 
                                style={styles.matcherReviewCard}
                                onPress={() => navigation.navigate("JobDetail", { id: item._id || item.id })}
                            >
                                <View style={styles.reviewerIconWrap}>
                                    <Feather name="user" size={20} color="#3B82F6" />
                                </View>
                                <View style={styles.reviewContent}>
                                    <Text style={styles.reviewerName}>Matcher Review</Text>
                                    <Text style={styles.reviewSubText}>1 updated job</Text>
                                </View>
                                <View style={styles.miniBadge}>
                                    <Text style={styles.miniBadgeText}>2</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        <View style={{ paddingHorizontal: 16 }}>
                            <JobCard job={item} />
                        </View>
                    </View>
                )}
                ListEmptyComponent={() => !loading && (
                    <View style={styles.emptyContainer}>
                        <Feather name="briefcase" size={48} color="#CBD5E1" />
                        <Text style={styles.emptyTitle}>No jobs found</Text>
                    </View>
                )}
            />
            {loading && !refreshing && (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    headerContainer: { marginBottom: 12 },
    headerSolid: {
        width: '100%',
        paddingBottom: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    titleBar: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    userNameWrapper: { flex: 1, paddingRight: 10 },
    roleLabelText: { fontSize: 13, fontWeight: '500', marginBottom: 4 },
    userNameText: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
    headerIconBtnSolid: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
    },
    unreadNotifMarker: {
        position: "absolute",
        top: 12,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: "#fff",
        backgroundColor: '#ef4444',
    },
    contentPadding: {
        paddingHorizontal: 16,
        marginTop: -30,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 16,
        borderWidth: 1.5,
        paddingHorizontal: 16,
        height: 56,
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 15,
        elevation: 6,
        marginBottom: 20,
    },
    searchField: { flex: 1, fontSize: 16, fontWeight: '400' },
    searchFilterBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    quickMetricsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 24,
    },
    metricCard: {
        flex: 1,
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        alignItems: "flex-start",
        gap: 4,
    },
    metricIconBox: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
    },
    metricValText: { fontSize: 16, fontWeight: '700' },
    metricLabelText: { fontSize: 11, fontWeight: '500' },
    tabSwitcher: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    tabBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    tabBtnText: {
        fontSize: 14,
        fontWeight: '700',
    },
    sectionHeading: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
    categoryListContent: { paddingBottom: 10, gap: 10 },
    categoryChip: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1.5,
        justifyContent: "center",
        alignItems: "center",
    },
    categoryChipLabel: { fontSize: 14, fontWeight: '600' },
    resultsHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 24,
        marginBottom: 16,
    },
    resultsLabel: { fontSize: 15, fontWeight: '700' },
    sortText: { fontSize: 13, fontWeight: '600' },
    jobItemWrapper: {
        marginBottom: 20,
    },
    matcherReviewCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 20,
        marginBottom: -15,
        marginHorizontal: 16,
        zIndex: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    reviewerIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    reviewContent: {
        flex: 1,
    },
    reviewerName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
    },
    reviewSubText: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 2,
    },
    miniBadge: {
        backgroundColor: '#F1F5F9',
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    miniBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 50,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#94A3B8',
        marginTop: 10,
    },
    loader: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
});
