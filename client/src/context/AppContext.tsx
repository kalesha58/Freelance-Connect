import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "@/utils/apiClient";

export type UserRole = "freelancer" | "requester" | "hiring" | null;

export interface User {
    _id: string; // Backend uses _id
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    bio?: string;
    tagline?: string;
    location?: string;
    companyName?: string;
    companyWebsite?: string;
    industry?: string;
    skills?: string[];
    services?: string[];
    education?: {
        institution: string;
        degree: string;
        startYear: string;
        endYear: string;
    }[];
    experience?: {
        company: string;
        role: string;
        startYear: string;
        endYear: string;
        description: string;
    }[];
    rating?: number;
    projectsCompleted?: number;
    earnings?: number;
    followers?: number;
    following?: number;
    isSubscribed?: boolean;
    chatUnlockCount?: number;
    isProfileComplete?: boolean;
    hourlyRate?: number;
    portfolioItems?: { title?: string; imageUrl?: string; link?: string }[];
    freelancerReviews?: { clientName: string; rating: number; comment?: string; createdAt?: string }[];
    isAvailableForHire?: boolean;
}

export interface Job {
    _id: string;
    title: string;
    budget: string;
    budgetType: "fixed" | "hourly";
    location: string;
    deadline: string;
    description: string;
    skills: string[];
    clientId?: string;
    clientName: string;
    clientAvatar?: string;
    clientRating: number;
    category: string;
    postedAt: string;
    applicants: number;
    isRemote: boolean;
}

export interface Comment {
    _id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    text: string;
    likes: string[];
    replies: Reply[];
    createdAt: string;
}

export interface Reply {
    _id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    text: string;
    createdAt: string;
}

export interface Post {
    _id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    userRole: "freelancer" | "requester" | "hiring";
    type?: "social" | "portfolio";
    imageUrl?: string;
    caption: string;
    tags: string[];
    likes: string[];          // Array of userIds
    likedByMe: boolean;       // Computed on load: does current user's id appear in likes[]?
    comments: Comment[];
    createdAt: string;
}

export interface Conversation {
    _id: string;
    participants: any[];
    lastMessage: string;
    lastMessageTime: string;
    isLocked: boolean;
    updatedAt: string;
    unreadCount?: number;
}

interface AppContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    jobs: Job[];
    posts: Post[];
    conversations: Conversation[];
    signIn: (emailOrPhone: string, password: string) => Promise<void>;
    signUp: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
    signOut: () => Promise<void>;
    fetchPosts: () => Promise<void>;
    toggleLike: (postId: string) => Promise<void>;
    addPost: (post: Partial<Post>) => Promise<void>;
    updateProfile: (profileData: Partial<User>) => Promise<void>;
    fetchJobs: () => Promise<void>;
    addJob: (jobData: any) => Promise<void>;
    forgotPassword: (emailOrPhone: string) => Promise<void>;
    verifyOTP: (email: string, otp: string) => Promise<void>;
    resetPassword: (emailOrPhone: string, otp: string, password: string) => Promise<void>;
    fetchConversations: () => Promise<void>;
    fetchMessages: (conversationId: string) => Promise<any[]>;
    sendMessage: (receiverId: string, text: string) => Promise<void>;
    applyToJob: (jobId: string, coverLetter: string) => Promise<void>;
    fetchApplicants: (jobId: string) => Promise<any[]>;
    updateApplicationStatus: (applicationId: string, status: string) => Promise<void>;
    searchFreelancers: (query?: string, category?: string) => Promise<any[]>;
    unlockChat: (conversationId: string) => void;
    fetchComments: (postId: string) => Promise<{ comments: Comment[]; postOwnerId: string }>;
    addComment: (postId: string, text: string) => Promise<Comment>;
    addReply: (postId: string, commentId: string, text: string) => Promise<Reply>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const token = await AsyncStorage.getItem("tasker_token");
            if (token) {
                const userData = await apiClient("/auth/me");
                setUser(userData);
                fetchPosts(userData._id);
                fetchJobs();
                fetchConversations();
            }
        } catch (e) {
            console.log("Failed to load user:", e);
            await signOut();
        } finally {
            setIsLoading(false);
        }
    };

    // Enrich posts with likedByMe flag based on current userId
    const enrichPosts = (rawPosts: any[], currentUserId?: string): Post[] => {
        return rawPosts.map(p => ({
            ...p,
            likes: Array.isArray(p.likes) ? p.likes : [],
            likedByMe: currentUserId
                ? (Array.isArray(p.likes) ? p.likes.some((id: string) => id.toString() === currentUserId) : false)
                : false,
        }));
    };

    const fetchPosts = async (userId?: string) => {
        try {
            const data = await apiClient("/posts");
            const uid = userId || user?._id;
            setPosts(enrichPosts(data, uid));
        } catch (error) {
            console.error("Fetch Posts Error:", error);
        }
    };

    const fetchJobs = async () => {
        try {
            const data = await apiClient("/jobs");
            setJobs(data);
        } catch (error) {
            console.error("Fetch Jobs Error:", error);
        }
    };

    const fetchConversations = async () => {
        try {
            const data = await apiClient("/chat/conversations");
            setConversations(data);
        } catch (error) {
            console.error("Fetch Conversations Error:", error);
        }
    };

    const signIn = async (emailOrPhone: string, password: string) => {
        try {
            const data = await apiClient("/auth/login", {
                method: "POST",
                body: { emailOrPhone, password },
            });

            await AsyncStorage.setItem("tasker_token", data.token);
            setUser(data);
            fetchPosts(data._id);
            fetchJobs();
        } catch (error) {
            throw error;
        }
    };

    const signUp = async (name: string, email: string, password: string, role: UserRole) => {
        try {
            const data = await apiClient("/auth/signup", {
                method: "POST",
                body: { name, email, password, role },
            });

            await AsyncStorage.setItem("tasker_token", data.token);
            setUser(data);
            fetchPosts(data._id);
            fetchJobs();
        } catch (error) {
            throw error;
        }
    };

    const updateProfile = async (profileData: Partial<User>) => {
        try {
            const updatedUser = await apiClient("/profile", {
                method: "PUT",
                body: profileData,
            });
            setUser(updatedUser);
        } catch (error) {
            throw error;
        }
    };

    const signOut = async () => {
        await AsyncStorage.removeItem("tasker_token");
        setUser(null);
    };

    const toggleLike = async (postId: string) => {
        // Optimistic update first
        setPosts(prev =>
            prev.map(p =>
                p._id === postId
                    ? {
                        ...p,
                        likedByMe: !p.likedByMe,
                        likes: p.likedByMe
                            ? p.likes.filter(id => id !== user?._id)
                            : [...p.likes, user?._id ?? ''],
                    }
                    : p
            )
        );

        try {
            await apiClient(`/posts/${postId}/like`, { method: "POST" });
        } catch (error) {
            // Revert on failure
            console.error("Toggle Like Error:", error);
            setPosts(prev =>
                prev.map(p =>
                    p._id === postId
                        ? {
                            ...p,
                            likedByMe: !p.likedByMe,
                            likes: p.likedByMe
                                ? p.likes.filter(id => id !== user?._id)
                                : [...p.likes, user?._id ?? ''],
                        }
                        : p
                )
            );
        }
    };

    const addPost = async (postData: Partial<Post>) => {
        try {
            const newPost = await apiClient("/posts", {
                method: "POST",
                body: postData,
            });
            const enriched = enrichPosts([newPost], user?._id);
            setPosts(prev => [enriched[0], ...prev]);
        } catch (error) {
            throw error;
        }
    };

    const addJob = async (jobData: any) => {
        try {
            const newJob = await apiClient("/jobs", {
                method: "POST",
                body: jobData,
            });
            setJobs(prev => [newJob, ...prev]);
        } catch (error) {
            throw error;
        }
    };

    const forgotPassword = async (emailOrPhone: string) => {
        await apiClient("/auth/forgot-password", {
            method: "POST",
            body: { emailOrPhone },
        });
    };

    const verifyOTP = async (email: string, otp: string) => {
        await apiClient("/auth/verify-otp", {
            method: "POST",
            body: { email, otp },
        });
    };

    const resetPassword = async (emailOrPhone: string, otp: string, password: string) => {
        await apiClient("/auth/reset-password", {
            method: "POST",
            body: { emailOrPhone, otp, password },
        });
    };

    const fetchMessages = async (conversationId: string) => {
        return await apiClient(`/chat/conversations/${conversationId}/messages`);
    };

    const sendMessage = async (receiverId: string, text: string) => {
        await apiClient("/chat/messages", {
            method: "POST",
            body: { receiverId, text },
        });
        fetchConversations();
    };

    const applyToJob = async (jobId: string, coverLetter: string) => {
        await apiClient(`/jobs/${jobId}/apply`, {
            method: "POST",
            body: { coverLetter },
        });
        fetchJobs();
    };

    const fetchApplicants = async (jobId: string) => {
        return await apiClient(`/jobs/${jobId}/applicants`);
    };

    const updateApplicationStatus = async (applicationId: string, status: string) => {
        await apiClient(`/jobs/applications/${applicationId}`, {
            method: "PUT",
            body: { status },
        });
    };

    const searchFreelancers = async (search?: string, category?: string) => {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append("search", search);
        if (category) queryParams.append("category", category);

        return await apiClient(`/users/freelancers?${queryParams.toString()}`);
    };

    const unlockChat = (conversationId: string) => {
        setConversations(prev =>
            prev.map(c =>
                c._id === conversationId
                    ? { ...c, isLocked: false }
                    : c
            )
        );
    };

    // ── Comment API Helpers ──────────────────────────────────────────────────

    const fetchComments = async (postId: string): Promise<{ comments: Comment[]; postOwnerId: string }> => {
        return await apiClient(`/posts/${postId}/comments`);
    };

    const addComment = async (postId: string, text: string): Promise<Comment> => {
        const newComment = await apiClient(`/posts/${postId}/comments`, {
            method: "POST",
            body: { text },
        });
        // Update comment count locally
        setPosts(prev =>
            prev.map(p =>
                p._id === postId
                    ? { ...p, comments: [...p.comments, newComment] }
                    : p
            )
        );
        return newComment;
    };

    const addReply = async (postId: string, commentId: string, text: string): Promise<Reply> => {
        const newReply = await apiClient(`/posts/${postId}/comments/${commentId}/reply`, {
            method: "POST",
            body: { text },
        });
        return newReply;
    };

    return (
        <AppContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                jobs,
                posts,
                conversations,
                signIn,
                signUp,
                signOut,
                fetchPosts,
                fetchJobs,
                fetchConversations,
                fetchMessages,
                addJob,
                forgotPassword,
                verifyOTP,
                resetPassword,
                sendMessage,
                applyToJob,
                fetchApplicants,
                updateApplicationStatus,
                searchFreelancers,
                toggleLike,
                addPost,
                updateProfile,
                unlockChat,
                fetchComments,
                addComment,
                addReply,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useApp must be used within AppProvider");
    return ctx;
}
