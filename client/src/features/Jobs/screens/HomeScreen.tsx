import React, { useEffect, useState } from "react";
import {
    FlatList,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";

import { FreelancerCard, IFreelancerProfile, JobCard, IJob } from "@/components";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const CATEGORIES_FREELANCER = ["All", "Mobile Dev", "Web Dev", "Design", "Data Science"];
const SKILLS_FILTER = ["All", "React Native", "UI/UX Design", "Python", "Swift", "Branding"];

/**
 * HomeScreen provides a rich professional marketplace for Jobs and Freelancers.
 * Redesigned for a modern, high-fidelity experience with brand-consistent headers.
 */
export default function HomeScreen() {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const { user, jobs, searchFreelancers, searchJobs, fetchJobs, appliedJobIds, toggleSaveJob, savedJobIds } = useApp();
    const navigation = useNavigation<any>();
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [freelancers, setFreelancers] = useState<IFreelancerProfile[]>([]);
    const [isLoadingFreelancers, setIsLoadingFreelancers] = useState(false);
    const [isLoadingJobs, setIsLoadingJobs] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoadingJobs(true);
            await fetchJobs();
            setIsLoadingJobs(false);
            loadFreelancers();
        };
        loadInitialData();
    }, []);

    const topPaddingOffset = Platform.OS === "ios" ? insets.top : 20;
    const isHiringRole = user?.role === "hiring" || user?.role === "requester";

    const loadFreelancers = async () => {
        setIsLoadingFreelancers(true);
        try {
            const category = activeFilter === "All" ? undefined : activeFilter;
            const data = await searchFreelancers(search, category);
            // Map User object to IFreelancerProfile
            const formatted: IFreelancerProfile[] = data.map((f: any) => ({
                id: f._id,
                name: f.name,
                title: f.tagline || "",
                avatar: f.avatar || f.profilePic,
                bio: f.bio || "No bio provided.",
                skills: f.skills || [],
                rating: f.rating || 0,
                hourlyRate: `₹${f.hourlyRate ?? 0}`,
                location: f.location || "Unknown",
                completedProjects: f.projectsCompleted || 0,
                reviewsCount: Array.isArray(f.freelancerReviews) ? f.freelancerReviews.length : 0,
                isTopRated: (f.rating || 0) >= 4.8
            }));
            setFreelancers(formatted);
        } catch (error) {
            console.error("Load Freelancers Error:", error);
        } finally {
            setIsLoadingFreelancers(false);
        }
    };


    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (isHiringRole) {
                loadFreelancers();
            } else {
                // If searching or filtering, use searchJobs, otherwise fetch all
                if (search || activeFilter !== "All") {
                    searchJobs(search, activeFilter === "All" ? undefined : activeFilter);
                } else {
                    fetchJobs();
                }
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search, activeFilter, isHiringRole]);


    const filteredJobs = jobs.filter(j => {
        const query = search.toLowerCase();
        const isSearchMatch = search === "" || 
            j.title?.toLowerCase().includes(query) || 
            j.description?.toLowerCase().includes(query) ||
            (Array.isArray(j.skills) && j.skills.some(s => s.toLowerCase().includes(query)));
            
        const isFilterMatch = activeFilter === "All" || 
            j.category?.toLowerCase().includes(activeFilter.toLowerCase()) ||
            (Array.isArray(j.skills) && j.skills.some(s => s.toLowerCase() === activeFilter.toLowerCase()));
            
        return isSearchMatch && isFilterMatch;
    });

    const renderRequesterHeader = () => (
        <View style={styles.headerContainer}>
            <StatusBar barStyle="light-content" backgroundColor={colors.headerBackground} />
            <View style={[styles.headerSolid, { backgroundColor: colors.headerBackground, paddingTop: topPaddingOffset + 8, paddingBottom: 15 }]}>
                <View style={styles.titleBar}>
                    <View style={styles.userNameWrapper}>
                        <Text style={[styles.roleLabelText, { color: 'rgba(255,255,255,0.7)' }]}>Hiring Partner</Text>
                        <Text style={[styles.userNameText, { color: '#fff' }]} numberOfLines={1}>{user?.name ?? "Guest"}</Text>
                    </View>
                    <View style={styles.headerActionGroup}>
                        <TouchableOpacity
                            style={[styles.headerIconBtnSolid, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
                            onPress={() => navigation.navigate("Notifications")}
                        >
                            <Ionicons name="notifications-outline" size={21} color="#fff" />
                            <View style={[styles.unreadNotifMarker, { backgroundColor: colors.destructive }]} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.primaryActionBtnSolid, { backgroundColor: '#fff' }]}
                            onPress={() => navigation.navigate("CreateJob")}
                        >
                            <Feather name="plus" size={21} color={colors.headerBackground} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.contentPadding}>
                <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Feather name="search" size={18} color={colors.mutedForeground} />
                    <TextInput
                        style={[styles.searchField, { color: colors.foreground }]}
                        placeholder="Search top freelancers..."
                        placeholderTextColor={colors.mutedForeground}
                        value={search}
                        onChangeText={setSearch}
                    />
                    <TouchableOpacity
                        style={[styles.searchFilterBtn, { backgroundColor: colors.buttonPrimary }]}
                        onPress={() => navigation.navigate("FilterModal")}
                    >
                        <Feather name="sliders" size={16} color={colors.onButtonPrimary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.quickMetricsRow}>
                    {[
                        { label: "Available", value: freelancers.length, color: "#3b82f6", icon: "people" },
                        { label: "Rating", value: user?.rating ? `${user.rating} ★` : "4.5 ★", color: "#f59e0b", icon: "star" },
                        { label: "Projects", value: user?.projectsCompleted ?? 0, color: "#10b981", icon: "checkmark-circle" },
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

                <Text style={[styles.sectionHeading, { color: colors.foreground }]}>Browse by Category</Text>
                <FlatList
                    data={CATEGORIES_FREELANCER}
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
                        Recommended {freelancers.length} Freelancers
                    </Text>
                    <TouchableOpacity>
                        <Text style={[styles.sortText, { color: colors.primary }]}>Sort by Relevance</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderFreelancerHeader = () => (
        <View style={styles.headerContainer}>
            <StatusBar barStyle="light-content" backgroundColor={colors.headerBackground} />
            <View style={[styles.headerSolid, { backgroundColor: colors.headerBackground, paddingTop: topPaddingOffset + 8, paddingBottom: 15 }]}>
                <View style={styles.titleBar}>
                    <View style={styles.userNameWrapper}>
                        <Text style={[styles.userNameText, { color: '#fff', marginTop: 10 }]} numberOfLines={1}>{user?.name ?? "Guest"}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.headerIconBtnSolid, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
                        onPress={() => navigation.navigate("Notifications")}
                    >
                        <Ionicons name="notifications-outline" size={22} color="#fff" />
                        <View style={[styles.unreadNotifMarker, { backgroundColor: colors.destructive }]} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.contentPadding}>
                <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Feather name="search" size={18} color={colors.mutedForeground} />
                    <TextInput
                        style={[styles.searchField, { color: colors.foreground }]}
                        placeholder="Search for your next job..."
                        placeholderTextColor={colors.mutedForeground}
                        value={search}
                        onChangeText={setSearch}
                    />
                    <TouchableOpacity
                        style={[styles.searchFilterBtn, { backgroundColor: colors.buttonPrimary }]}
                        onPress={() => navigation.navigate("FilterModal")}
                    >
                        <Feather name="sliders" size={16} color={colors.onButtonPrimary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.quickMetricsRow}>
                    {[
                        { label: "Active Jobs", value: jobs.length, color: "#3b82f6", icon: "briefcase" },
                        { label: "Applied", value: appliedJobIds?.length ?? 0, color: "#f59e0b", icon: "send" },
                        { label: "Earnings", value: `₹${user?.earnings ?? 0}`, color: "#10b981", icon: "wallet" },
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
        <View style={[styles.mainView, { backgroundColor: colors.background }]}>
            <FlatList
                data={(isHiringRole ? freelancers : filteredJobs) as any[]}
                keyExtractor={(item) => item._id || item.id}
                renderItem={({ item }) => {
                    if (isHiringRole) {
                        const f = item as IFreelancerProfile;
                        return (
                            <View style={{ paddingHorizontal: 16 }}>
                                <FreelancerCard
                                    freelancer={f}
                                    onHire={() => navigation.navigate("HireConfirm", { 
                                        freelancerId: f.id,
                                        freelancerName: f.name,
                                        freelancerAvatar: f.avatar
                                    })}
                                    onPress={() => navigation.navigate("FreelancerProfile", { id: f.id })}
                                />
                            </View>
                        );
                    }
                    return (
                        <View style={{ paddingHorizontal: 16 }}>
                            <JobCard 
                                job={item as unknown as IJob} 
                                isSaved={savedJobIds.includes(item._id || item.id)}
                                onSave={toggleSaveJob}
                            />
                        </View>
                    );
                }}
                ListHeaderComponent={isHiringRole ? renderRequesterHeader() : renderFreelancerHeader()}
                contentContainerStyle={[
                    styles.mainListContent,
                    { paddingBottom: 80 + insets.bottom }
                ]}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                    <View style={styles.emptyResultsBox}>
                        <Feather name={isHiringRole ? "users" : "briefcase"} size={48} color={colors.mutedForeground} />
                        <Text style={[styles.emptyResultsTitle, { color: colors.foreground }]}>
                            {isHiringRole ? "No Freelancers Found" : "No Jobs Found"}
                        </Text>
                        <Text style={[styles.emptyResultsCopy, { color: colors.mutedForeground }]}>Try adjusting your search filters.</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    mainView: { flex: 1 },
    mainListContent: { paddingBottom: 20 },
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
    contentPadding: {
        paddingHorizontal: 16,
        marginTop: -10, // Reduced overlap for more space
    },
    roleLabelText: { fontSize: 13, fontWeight: '500', marginBottom: 4 },
    userNameText: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
    userNameWrapper: { flex: 1, paddingRight: 10 },
    headerActionGroup: { flexDirection: "row", gap: 10, alignItems: 'center' },
    headerIconBtnSolid: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
    },
    primaryActionBtnSolid: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
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
    emptyResultsBox: { alignItems: "center", paddingTop: 80, gap: 12 },
    emptyResultsTitle: { fontSize: 18, fontWeight: '700' },
    emptyResultsCopy: { fontSize: 14, fontWeight: '400', textAlign: "center", paddingHorizontal: 40 },
});
