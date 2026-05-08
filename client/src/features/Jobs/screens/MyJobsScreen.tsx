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
import { JobCardSkeleton } from "@/components/SkeletonLoader.tsx";



/**
 * MyJobsScreen mirrored from HomeScreen layout to show applied/posted jobs.
 */
export default function MyJobsScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { user, fetchMyPostings, fetchMyAppliedJobs, fetchMyHires, savedJobIds, jobs: allJobs, toggleSaveJob } = useApp();
    
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<"applied" | "saved" | "posted" | "hired">(
        (user?.role === 'hiring' || user?.role === 'requester') ? "hired" : "applied"
    );
    const [search, setSearch] = useState("");

    const fetchData = async () => {
        if (!refreshing) setLoading(true);
        try {
            if (activeTab === 'hired') {
                const results = await fetchMyHires();
                setJobs(results || []);
            } else if (activeTab === 'applied') {
                const results = await fetchMyAppliedJobs();
                setJobs(results || []);
            } else if (activeTab === 'saved') {
                const results = allJobs.filter(j => savedJobIds.includes((j._id || j.id || "")));
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
            
        return isSearchMatch;
    });

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <StatusBar barStyle="light-content" backgroundColor={colors.headerBackground} />
            <View style={[styles.headerSolid, { backgroundColor: colors.headerBackground, paddingTop: topPaddingOffset + 8, paddingBottom: 15 }]}>
                <View style={styles.titleBar}>
                    <View style={styles.userNameWrapper}>
                        <Text style={[styles.userNameText, { color: '#fff', marginTop: 10 }]}>
                            {activeTab === 'hired' ? 'My Hires' : activeTab === 'posted' ? 'Manage Postings' : activeTab === 'applied' ? 'Applied Jobs' : 'Saved Items'}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.contentPadding}>
                <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Feather name="search" size={18} color={colors.mutedForeground} />
                    <TextInput
                        style={[styles.searchField, { color: colors.foreground }]}
                        placeholder={`Search in ${activeTab === 'hired' ? 'hires' : activeTab === 'applied' ? 'applied jobs' : activeTab === 'saved' ? 'saved items' : 'postings'}...`}
                        placeholderTextColor={colors.mutedForeground}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                {/* Metrics removed as requested */}

                <View style={styles.tabSwitcher}>
                    <TouchableOpacity 
                        style={[styles.tabBtn, (activeTab === 'applied' || activeTab === 'hired') && { backgroundColor: colors.primary }]} 
                        onPress={() => setActiveTab((user?.role === 'hiring' || user?.role === 'requester') ? 'hired' : 'applied')}
                    >
                        <Text style={[styles.tabBtnText, { color: (activeTab === 'applied' || activeTab === 'hired') ? '#fff' : colors.foreground }]}>
                            {(user?.role === 'hiring' || user?.role === 'requester') ? 'Hires' : 'Applied'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tabBtn, activeTab === 'saved' && { backgroundColor: colors.primary }]} 
                        onPress={() => setActiveTab('saved')}
                    >
                        <Text style={[styles.tabBtnText, { color: activeTab === 'saved' ? '#fff' : colors.foreground }]}>Saved</Text>
                    </TouchableOpacity>
                    {(user?.role === 'hiring' || user?.role === 'requester') && (
                        <TouchableOpacity 
                            style={[styles.tabBtn, activeTab === 'posted' && { backgroundColor: colors.primary }]} 
                            onPress={() => setActiveTab('posted')}
                        >
                            <Text style={[styles.tabBtnText, { color: activeTab === 'posted' ? '#fff' : colors.foreground }]}>Postings</Text>
                        </TouchableOpacity>
                    )}
                </View>


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
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                contentContainerStyle={{ paddingBottom: 100 }}
                renderItem={({ item }) => {
                    if (activeTab === 'hired') {
                        return (
                            <View style={styles.jobItemWrapper}>
                                <View style={{ paddingHorizontal: 16 }}>
                                    <View style={[styles.freelancerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                        <View style={styles.freelancerHeader}>
                                            <View style={[styles.freelancerAvatar, { backgroundColor: colors.headerBackground }]}>
                                                <Text style={styles.avatarInitials}>{item.name?.charAt(0)}</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.freelancerName, { color: colors.foreground }]}>{item.name}</Text>
                                                <Text style={[styles.freelancerTitle, { color: colors.mutedForeground }]}>{item.title}</Text>
                                                <View style={styles.ratingRow}>
                                                    <Ionicons name="star" size={12} color={colors.warning} />
                                                    <Text style={[styles.ratingText, { color: colors.foreground }]}>{item.rating}</Text>
                                                </View>
                                            </View>
                                            <TouchableOpacity 
                                                style={[styles.convoBtn, { backgroundColor: colors.blueLight }]}
                                                onPress={() => navigation.navigate("Chat", { 
                                                    participantId: item.freelancerId, 
                                                    participantName: item.name 
                                                })}
                                            >
                                                <Feather name="message-circle" size={18} color={colors.primary} />
                                            </TouchableOpacity>
                                        </View>
                                        
                                        <View style={[styles.hireJobTag, { backgroundColor: colors.muted }]}>
                                            <Text style={[styles.hireJobLabel, { color: colors.mutedForeground }]}>Hired for:</Text>
                                            <Text style={[styles.hireJobValue, { color: colors.foreground }]} numberOfLines={1}>{item.jobTitle}</Text>
                                        </View>

                                        <View style={styles.skillBadgeRow}>
                                            {item.skills.slice(0, 3).map((skill: string) => (
                                                <View key={skill} style={[styles.miniSkillBadge, { backgroundColor: colors.border + "40" }]}>
                                                    <Text style={[styles.miniSkillText, { color: colors.mutedForeground }]}>{skill}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        );
                    }
                    return (
                        <View style={styles.jobItemWrapper}>
                            <View style={{ paddingHorizontal: 16 }}>
                                <JobCard 
                                    job={item} 
                                    isSaved={savedJobIds.includes(item._id || item.id)}
                                    onSave={toggleSaveJob}
                                />
                            </View>
                        </View>
                    );
                }}
                ListEmptyComponent={() => !loading && (
                    <View style={styles.emptyContainer}>
                        <Feather name="briefcase" size={48} color="#CBD5E1" />
                        <Text style={styles.emptyTitle}>No jobs found</Text>
                    </View>
                )}
            />
            {loading && !refreshing && (
                <View style={{ padding: 16 }}>
                    <JobCardSkeleton />
                    <JobCardSkeleton />
                    <JobCardSkeleton />
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
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
    },
    userNameWrapper: { flex: 1, paddingRight: 10 },
    roleLabelText: { fontSize: 13, fontWeight: '500', marginBottom: 4 },
    userNameText: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
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
        marginTop: -10,
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
    freelancerCard: {
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    freelancerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    freelancerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitials: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    freelancerName: {
        fontSize: 16,
        fontWeight: '700',
    },
    freelancerTitle: {
        fontSize: 12,
        fontWeight: '400',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '600',
    },
    convoBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    hireJobTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    hireJobLabel: {
        fontSize: 11,
        fontWeight: '600',
    },
    hireJobValue: {
        fontSize: 11,
        fontWeight: '700',
        flex: 1,
    },
    skillBadgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    miniSkillBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    miniSkillText: {
        fontSize: 10,
        fontWeight: '600',
    },
});
