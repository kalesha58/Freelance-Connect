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
    clientName: string;
    clientAvatar?: string;
    clientRating: number;
    category: string;
    postedAt: string;
    applicants: number;
    isRemote: boolean;
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
    likes: number;
    comments: any[];
    isLiked: boolean;
    createdAt: string;
}

export interface Conversation {
    id: string;
    participantId: string;
    participantName: string;
    participantAvatar?: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    isLocked: boolean;
    messages: any[];
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
    toggleLike: (postId: string) => void;
    addPost: (post: Partial<Post>) => Promise<void>;
    updateProfile: (profileData: Partial<User>) => Promise<void>;
    fetchJobs: () => Promise<void>;
    addJob: (jobData: any) => Promise<void>;
    forgotPassword: (emailOrPhone: string) => Promise<void>;
    verifyOTP: (email: string, otp: string) => Promise<void>;
    resetPassword: (emailOrPhone: string, otp: string, password: string) => Promise<void>;
    sendMessage: (conversationId: string, text: string) => void;
    unlockChat: (conversationId: string) => void;
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
                fetchPosts();
                fetchJobs(); // Load initial jobs
            }
        } catch (e) {
            console.log("Failed to load user:", e);
            await signOut();
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPosts = async () => {
        try {
            const data = await apiClient("/posts");
            setPosts(data);
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

    const signIn = async (emailOrPhone: string, password: string) => {
        try {
            const data = await apiClient("/auth/login", {
                method: "POST",
                body: { emailOrPhone, password },
            });

            await AsyncStorage.setItem("tasker_token", data.token);
            setUser(data);
            fetchPosts();
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
            fetchPosts();
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

    const toggleLike = (postId: string) => {
        // Backend doesn't have like endpoint yet, updating locally
        setPosts(prev =>
            prev.map(p =>
                p._id === postId
                    ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
                    : p
            )
        );
    };

    const addPost = async (postData: Partial<Post>) => {
        try {
            const newPost = await apiClient("/posts", {
                method: "POST",
                body: postData,
            });
            setPosts(prev => [newPost, ...prev]);
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

    const sendMessage = (conversationId: string, text: string) => {
        // Mocking for now as backend doesn't have messages yet
        setConversations(prev =>
            prev.map(c =>
                c.id === conversationId
                    ? {
                        ...c,
                        lastMessage: text,
                        lastMessageTime: "Now",
                        messages: [
                            ...(c.messages || []),
                            { id: Date.now().toString(), senderId: "me", text, timestamp: "Now", isRead: true },
                        ],
                    }
                    : c
            )
        );
    };

    const unlockChat = (conversationId: string) => {
        setConversations(prev =>
            prev.map(c =>
                c.id === conversationId
                    ? {
                        ...c,
                        isLocked: false,
                        messages: [
                            { id: "unlocked", senderId: c.participantId, text: "Hi! I saw your profile and I'm interested in working with you.", timestamp: "Now", isRead: false },
                        ],
                    }
                    : c
            )
        );
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
                addJob,
                forgotPassword,
                verifyOTP,
                resetPassword,
                toggleLike,
                addPost,
                updateProfile,
                sendMessage,
                unlockChat,
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
