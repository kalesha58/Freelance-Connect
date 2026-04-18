import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { apiClient, uploadImage } from "@/utils/apiClient";
import database from '@react-native-firebase/database';
import { IStatus, IStatusViewer } from "@/navigation/types";




export type UserRole = "freelancer" | "requester" | "hiring" | null;

export interface User {
    _id: string; // Backend uses _id
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    profilePic?: string;
    bio?: string;
    tagline?: string;
    location?: string;
    referralCode?: string;
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
    /** External portfolio site (Behance, personal site, etc.) */
    portfolioUrl?: string;
}

export interface Job {
    _id: string;
    id?: string;
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
    /** Present when GET /posts is called as a freelancer: whether you follow this post's author. */
    isFollowingAuthor?: boolean;
    comments: Comment[];
    createdAt: string;
}

// Conversation type kept for any legacy code that may reference it
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
    signIn: (emailOrPhone: string, password: string) => Promise<void>;
    signUp: (name: string, email: string, password: string, role: UserRole, referredByCode?: string) => Promise<void>;
    signOut: () => Promise<void>;
    fetchPosts: () => Promise<void>;
    toggleLike: (postId: string) => Promise<void>;
    addPost: (post: Partial<Post>) => Promise<void>;
    updateProfile: (profileData: Partial<User>) => Promise<void>;
    /** Re-fetch the logged-in user from the API (same shape as app launch). Use after refresh or when opening Profile. */
    refreshCurrentUser: () => Promise<void>;
    fetchJobs: () => Promise<void>;
    addJob: (jobData: any) => Promise<void>;
    forgotPassword: (emailOrPhone: string) => Promise<void>;
    verifyOTP: (email: string, otp: string) => Promise<void>;
    resetPassword: (emailOrPhone: string, otp: string, password: string) => Promise<void>;
    applyToJob: (jobId: string, coverLetter: string) => Promise<void>;
    fetchApplicants: (jobId: string) => Promise<any[]>;
    updateApplicationStatus: (applicationId: string, status: string) => Promise<void>;
    searchFreelancers: (query?: string, category?: string) => Promise<any[]>;
    fetchComments: (postId: string) => Promise<{ comments: Comment[]; postOwnerId: string }>;
    addComment: (postId: string, text: string) => Promise<Comment>;
    addReply: (postId: string, commentId: string, text: string) => Promise<Reply>;
    deletePost: (postId: string) => Promise<void>;
    fetchAllUsers: () => Promise<any[]>;
    statuses: IStatus[];
    addStatus: (imageUri: string) => Promise<void>;
    loadStatuses: () => Promise<void>;
    /**
     * Mark a status as viewed.
     * If `viewer` is supplied (and is NOT the status owner), the viewer is recorded
     * in the status's `viewers` list so the owner can see who watched.
     */
    markStatusViewed: (
        statusId: string,
        viewer?: { userId: string; userName: string; userAvatar?: string }
    ) => void;

}


const AppContext = createContext<AppContextType | null>(null);

// Module-level constants — kept only for the auth storage key (status storage moved to DB).
const AUTH_TOKEN_KEY = "skill_link_token";

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [statuses, setStatuses] = useState<IStatus[]>([]);

    // presenceRef holds the RTDB connected listener so we can detach on sign-out
    const presenceRef = useRef<any>(null);

    useEffect(() => {
        loadUser();
    }, []);

    // Load statuses independently so the story bar appears quickly
    // even if /profile/me is slow. No cleanup interval needed —
    // MongoDB's TTL index handles expiry server-side.
    useEffect(() => {
        loadStatuses();
    }, []);


    const refreshCurrentUser = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

            if (!token) return;
            const userData = await apiClient("/profile/me");
            setUser(userData as User);
        } catch (e) {
            console.warn("refreshCurrentUser:", e);
        }
    }, []);

    const loadUser = async () => {
        try {
            const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

            if (token) {
                const userData = await apiClient("/profile/me");
                setUser(userData as User);
                // Firebase presence is handled by FirebaseProvider via currentUserId prop
                await Promise.all([
                    fetchPosts(userData._id),
                    fetchJobs(),
                ]);
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


    /** Same canonical user shape as cold start — login/signup responses may omit nested profile fields. */
    const hydrateUserAfterAuth = async (fallback: User | (User & { token?: string })) => {
        const id = fallback._id;
        try {
            const userData = await apiClient("/profile/me");
            setUser(userData as User);
            fetchPosts(userData._id);
        } catch {
            const { token: _t, ...rest } = fallback as User & { token?: string };
            setUser(rest as User);
            fetchPosts(id);
        }
        fetchJobs();
        loadStatuses();
    };


    const signIn = async (emailOrPhone: string, password: string) => {
        try {
            const data = await apiClient("/auth/login", {
                method: "POST",
                body: { emailOrPhone, password },
            });

            await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
            await hydrateUserAfterAuth(data);

        } catch (error) {
            throw error;
        }
    };

    const signUp = async (name: string, email: string, password: string, role: UserRole, referredByCode?: string) => {
        try {
            const data = await apiClient("/auth/signup", {
                method: "POST",
                body: { name, email, password, role, referredByCode },
            });

            await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
            await hydrateUserAfterAuth(data);

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
        // Clean up RTDB presence listener if set
        if (presenceRef.current) {
            database().ref('.info/connected').off('value', presenceRef.current);
            presenceRef.current = null;
        }
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        setUser(null);
        setStatuses([]); // Clear statuses on logout
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

    // Fetch all users except self — for NewChat screen
    const fetchAllUsers = async () => {
        return await apiClient('/users/all');
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

    // unlockChat is deprecated — kept as no-op for any remnant references
    const unlockChat = (_conversationId: string) => {};

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

    const deletePost = async (postId: string) => {
        try {
            await apiClient(`/posts/${postId}`, { method: "DELETE" });
            setPosts(prev => prev.filter(p => p._id !== postId));
        } catch (error) {
            console.error("Delete Post Error:", error);
            throw error;
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Status management — all backed by /api/statuses
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Fetch all active (non-expired) statuses from the backend.
     * Maps the API shape { _id, imageUrl, viewers, viewedByMe } to the
     * IStatus interface used throughout the app.
     */
    const loadStatuses = async () => {
        try {
            const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
            if (!token) return; // not logged in yet
            const data: any[] = await apiClient('/statuses');
            const mapped: IStatus[] = data.map(s => ({
                id:          s._id,
                userId:      String(s.userId),
                userName:    s.userName,
                userAvatar:  s.userAvatar,
                imageUri:    s.imageUrl,
                createdAt:   new Date(s.createdAt).getTime(),
                viewed:      s.viewedByMe ?? false,
                viewers:     (s.viewers ?? []).map((v: any) => ({
                    userId:     String(v.userId),
                    userName:   v.userName,
                    userAvatar: v.userAvatar,
                    viewedAt:   new Date(v.viewedAt).getTime(),
                })),
            }));

            setStatuses(mapped);
        } catch (e) {
            console.warn('[loadStatuses] error:', e);
            setStatuses([]);
        }
    };

    /**
     * Upload the image to Cloudinary via /api/upload, then create a status
     * document on the backend via POST /api/statuses.
     * Multiple statuses per day are allowed — the server does not restrict this.
     */
    const addStatus = async (imageUri: string) => {
        if (!user) throw new Error('You must be logged in to add a status.');
        try {
            // Step 1: Upload the image (same two-step pattern used for posts/avatars)
            const uploadResult = await uploadImage(imageUri);
            const imageUrl: string = uploadResult.url || uploadResult.imageUrl || uploadResult.secure_url;
            if (!imageUrl) throw new Error('Image upload returned no URL.');

            // Step 2: Create the status on the backend
            const saved: any = await apiClient('/statuses', {
                method: 'POST',
                body: { imageUrl },
            });

            // Step 3: Prepend to local state immediately so the UI updates
            const newStatus: IStatus = {
                id:         saved._id,
                userId:     String(saved.userId),
                userName:   saved.userName,
                userAvatar: saved.userAvatar,
                imageUri:   saved.imageUrl,
                createdAt:  new Date(saved.createdAt).getTime(),
                viewed:     false,
                viewers:    [],
            };

            setStatuses(prev => [newStatus, ...prev]);
        } catch (e: any) {
            console.warn('[addStatus] error:', e);
            throw new Error(e.message || 'Failed to add status. Please try again.');
        }
    };

    /**
     * Record the current user as a viewer of a status (fire-and-forget from UI).
     * Locally marks the status as viewed so the ring updates immediately.
     * If a viewer object is supplied, updates the local viewers list optimistically.
     */
    const markStatusViewed = (
        statusId: string,
        viewer?: { userId: string; userName: string; userAvatar?: string }
    ) => {
        // Optimistic local update so the ring colour changes instantly
        setStatuses(prev =>
            prev.map(s => {
                if (s.id !== statusId) return s;


                let updatedViewers = s.viewers ?? [];
                if (viewer && viewer.userId !== s.userId) {
                    const alreadyRecorded = updatedViewers.some(v => v.userId === viewer.userId);
                    if (!alreadyRecorded) {
                        const newViewer: IStatusViewer = {
                            ...viewer,
                            viewedAt: Date.now(),
                        };
                        updatedViewers = [newViewer, ...updatedViewers];
                    }
                }
                return { ...s, viewed: true, viewers: updatedViewers };
            })
        );

        // Persist to backend asynchronously — don't block the UI
        apiClient(`/statuses/${statusId}/view`, { method: 'POST' }).catch(
            e => console.warn('[markStatusViewed] API error:', e)
        );
    };






    return (
        <AppContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading: !!user && isLoading, // Simplify slightly or keep as is
                jobs,
                posts,
                signIn,
                signUp,
                signOut,
                fetchPosts,
                fetchJobs,
                addJob,
                forgotPassword,
                verifyOTP,
                resetPassword,
                applyToJob,
                fetchApplicants,
                updateApplicationStatus,
                searchFreelancers,
                toggleLike,
                addPost,
                updateProfile,
                refreshCurrentUser,
                fetchComments,
                addComment,
                addReply,
                deletePost,
                fetchAllUsers,
                statuses,
                addStatus,
                loadStatuses,
                markStatusViewed,
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
