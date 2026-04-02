import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type UserRole = "freelancer" | "requester" | "hiring" | null;

export interface User {
    id: string;
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
    id: string;
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
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    userRole: "freelancer" | "requester" | "hiring";
    type?: "social" | "portfolio";
    imageUrl?: string;
    caption: string;
    tags: string[];
    likes: number;
    comments: number;
    isLiked: boolean;
    createdAt: string;
}

export interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
    isRead: boolean;
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
    messages: Message[];
}

interface AppContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    jobs: Job[];
    posts: Post[];
    conversations: Conversation[];
    signIn: (email: string, role: UserRole) => Promise<void>;
    signUp: (name: string, email: string, role: UserRole) => Promise<void>;
    signOut: () => Promise<void>;
    toggleLike: (postId: string) => void;
    addPost: (post: Omit<Post, "id" | "likes" | "comments" | "isLiked" | "createdAt" | "userId" | "userName" | "userAvatar" | "userRole">) => void;
    updateProfile: (profileData: Partial<User>) => Promise<void>;
    sendMessage: (conversationId: string, text: string) => void;
    unlockChat: (conversationId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const MOCK_JOBS: Job[] = [
    {
        id: "1",
        title: "Senior React Native Developer",
        budget: "$5,000 - $8,000",
        budgetType: "fixed",
        location: "Remote",
        deadline: "Dec 15, 2025",
        description: "We need an experienced React Native developer to build a cross-platform mobile app for our e-commerce platform. Must have 3+ years of experience.",
        skills: ["React Native", "TypeScript", "Redux", "REST APIs"],
        clientName: "TechCorp Inc.",
        clientRating: 4.8,
        category: "Mobile Development",
        postedAt: "2h ago",
        applicants: 12,
        isRemote: true,
    },
    {
        id: "2",
        title: "UI/UX Designer for FinTech App",
        budget: "$80/hr",
        budgetType: "hourly",
        location: "New York, USA",
        deadline: "Nov 30, 2025",
        description: "Looking for a talented UI/UX designer with experience in financial applications. You will design intuitive user flows, wireframes, and high-fidelity mockups.",
        skills: ["Figma", "UI Design", "UX Research", "Prototyping"],
        clientName: "FinStart Solutions",
        clientRating: 4.6,
        category: "Design",
        postedAt: "5h ago",
        applicants: 8,
        isRemote: false,
    },
    {
        id: "3",
        title: "Full Stack Web Developer",
        budget: "$3,500 - $6,000",
        budgetType: "fixed",
        location: "Remote",
        deadline: "Jan 10, 2026",
        description: "Build a comprehensive web platform for our healthcare startup. Need expertise in React, Node.js, and PostgreSQL.",
        skills: ["React", "Node.js", "PostgreSQL", "AWS"],
        clientName: "HealthTech Pro",
        clientRating: 4.9,
        category: "Web Development",
        postedAt: "1d ago",
        applicants: 23,
        isRemote: true,
    },
    {
        id: "4",
        title: "Python Data Scientist",
        budget: "$120/hr",
        budgetType: "hourly",
        location: "San Francisco, USA",
        deadline: "Dec 20, 2025",
        description: "We need a data scientist to analyze large datasets and build predictive models for our marketing platform.",
        skills: ["Python", "Machine Learning", "TensorFlow", "SQL"],
        clientName: "DataDriven Co.",
        clientRating: 4.7,
        category: "Data Science",
        postedAt: "2d ago",
        applicants: 15,
        isRemote: false,
    },
    {
        id: "5",
        title: "Brand Identity Designer",
        budget: "$2,000 - $4,000",
        budgetType: "fixed",
        location: "Remote",
        deadline: "Dec 5, 2025",
        description: "Create a complete brand identity package for our new startup including logo, color palette, typography, and brand guidelines.",
        skills: ["Branding", "Logo Design", "Adobe Illustrator", "Typography"],
        clientName: "Startup Ventures",
        clientRating: 4.5,
        category: "Design",
        postedAt: "3d ago",
        applicants: 31,
        isRemote: true,
    },
    {
        id: "6",
        title: "iOS Swift Developer",
        budget: "$90/hr",
        budgetType: "hourly",
        location: "Remote",
        deadline: "Jan 15, 2026",
        description: "Native iOS application development for a fitness tracking app. Experience with HealthKit and CoreMotion required.",
        skills: ["Swift", "SwiftUI", "HealthKit", "CoreMotion"],
        clientName: "FitLife Inc.",
        clientRating: 4.8,
        category: "Mobile Development",
        postedAt: "4d ago",
        applicants: 9,
        isRemote: true,
    },
];

const MOCK_POSTS: Post[] = [
    {
        id: "1",
        userId: "user1",
        userName: "Sarah Chen",
        userRole: "freelancer",
        caption: "Just delivered a complete brand identity for a fintech startup! Six weeks of work, from initial concepts to final guidelines. Proud of how this turned out.",
        tags: ["branding", "design", "fintech", "logo"],
        likes: 234,
        comments: 18,
        isLiked: false,
        createdAt: "2h ago",
    },
    {
        id: "2",
        userId: "user2",
        userName: "Marcus Johnson",
        userRole: "freelancer",
        caption: "New portfolio piece dropping. Built a full e-commerce dashboard for a retail client. Clean, fast, and mobile-responsive.",
        tags: ["webdev", "dashboard", "react", "portfolio"],
        likes: 189,
        comments: 24,
        isLiked: true,
        createdAt: "5h ago",
    },
    {
        id: "3",
        userId: "user3",
        userName: "TechVentures HQ",
        userRole: "requester",
        caption: "Looking for talented mobile developers! We just wrapped up our MVP and are seeking senior devs for the next phase. DM for details.",
        tags: ["hiring", "mobileDev", "startup", "opportunity"],
        likes: 312,
        comments: 47,
        isLiked: false,
        createdAt: "1d ago",
    },
    {
        id: "4",
        userId: "user4",
        userName: "Priya Patel",
        userRole: "freelancer",
        caption: "Three years of freelancing and finally hit my first 6-figure year! Grateful to every client who trusted my work. This community is everything.",
        tags: ["freelancelife", "milestone", "uxdesign", "grateful"],
        likes: 891,
        comments: 103,
        isLiked: false,
        createdAt: "2d ago",
    },
    {
        id: "5",
        userId: "user5",
        userName: "Alex Rivera",
        userRole: "freelancer",
        caption: "Just finished an animation package for a SaaS product. Motion design is where creativity meets code!",
        tags: ["animation", "motiondesign", "aftereffects", "saas"],
        likes: 445,
        comments: 32,
        isLiked: true,
        createdAt: "3d ago",
    },
];

const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: "conv1",
        participantId: "client1",
        participantName: "TechCorp Inc.",
        lastMessage: "When can you start the project?",
        lastMessageTime: "10:30 AM",
        unreadCount: 2,
        isLocked: false,
        messages: [
            { id: "m1", senderId: "client1", text: "Hi! We loved your portfolio.", timestamp: "10:15 AM", isRead: true },
            { id: "m2", senderId: "me", text: "Thank you! I'm very interested in the project.", timestamp: "10:20 AM", isRead: true },
            { id: "m3", senderId: "client1", text: "When can you start the project?", timestamp: "10:30 AM", isRead: false },
        ],
    },
    {
        id: "conv2",
        participantId: "client2",
        participantName: "FinStart Solutions",
        lastMessage: "Please send your portfolio link",
        lastMessageTime: "Yesterday",
        unreadCount: 0,
        isLocked: false,
        messages: [
            { id: "m4", senderId: "client2", text: "We need a UX designer for our app", timestamp: "Yesterday", isRead: true },
            { id: "m5", senderId: "me", text: "I specialize in fintech UX!", timestamp: "Yesterday", isRead: true },
            { id: "m6", senderId: "client2", text: "Please send your portfolio link", timestamp: "Yesterday", isRead: true },
        ],
    },
    {
        id: "conv3",
        participantId: "client3",
        participantName: "HealthTech Pro",
        lastMessage: "Unlock to read this message",
        lastMessageTime: "Mon",
        unreadCount: 1,
        isLocked: true,
        messages: [],
    },
    {
        id: "conv4",
        participantId: "client4",
        participantName: "DataDriven Co.",
        lastMessage: "Unlock to read this message",
        lastMessageTime: "Sun",
        unreadCount: 3,
        isLocked: true,
        messages: [],
    },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [jobs] = useState<Job[]>(MOCK_JOBS);
    const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
    const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const userData = await AsyncStorage.getItem("tasker_user");
            if (userData) {
                setUser(JSON.parse(userData));
            }
        } catch (e) {
            // ignore
        } finally {
            setIsLoading(false);
        }
    };

    const signIn = async (email: string, role: UserRole) => {
        const newUser: User = {
            id: Date.now().toString(),
            name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
            email,
            role,
            bio: "Passionate freelancer building great things.",
            skills: ["React Native", "TypeScript", "UI Design"],
            rating: 4.8,
            projectsCompleted: 24,
            earnings: 48500,
            followers: 312,
            following: 89,
            isSubscribed: false,
            chatUnlockCount: 3,
        };
        await AsyncStorage.setItem("tasker_user", JSON.stringify(newUser));
        setUser(newUser);
    };

    const signUp = async (name: string, email: string, role: UserRole) => {
        const newUser: User = {
            id: Date.now().toString(),
            name,
            email,
            role,
            bio: "",
            skills: [],
            rating: 0,
            projectsCompleted: 0,
            earnings: 0,
            followers: 0,
            following: 0,
            isSubscribed: false,
            chatUnlockCount: 3,
            isProfileComplete: false,
        };
        await AsyncStorage.setItem("tasker_user", JSON.stringify(newUser));
        setUser(newUser);
    };

    const updateProfile = async (profileData: Partial<User>) => {
        if (!user) return;
        const updatedUser = { ...user, ...profileData, isProfileComplete: true };
        await AsyncStorage.setItem("tasker_user", JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    const signOut = async () => {
        await AsyncStorage.removeItem("tasker_user");
        setUser(null);
    };

    const toggleLike = (postId: string) => {
        setPosts(prev =>
            prev.map(p =>
                p.id === postId
                    ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
                    : p
            )
        );
    };

    const addPost = (postData: Omit<Post, "id" | "likes" | "comments" | "isLiked" | "createdAt" | "userId" | "userName" | "userAvatar" | "userRole">) => {
        if (!user) return;
        const newPost: Post = {
            id: Date.now().toString(),
            userId: user.id,
            userName: user.name,
            userRole: user.role as "freelancer" | "requester",
            likes: 0,
            comments: 0,
            isLiked: false,
            createdAt: "Just now",
            ...postData,
        };
        setPosts(prev => [newPost, ...prev]);
    };

    const sendMessage = (conversationId: string, text: string) => {
        setConversations(prev =>
            prev.map(c =>
                c.id === conversationId
                    ? {
                        ...c,
                        lastMessage: text,
                        lastMessageTime: "Now",
                        messages: [
                            ...c.messages,
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
