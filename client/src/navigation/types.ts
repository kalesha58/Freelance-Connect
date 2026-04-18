export type RootStackParamList = {
    Splash: undefined;
    Onboarding: undefined;
    Login: undefined;
    Signup: { role?: 'freelancer' | 'hiring' | 'requester' };
    OTPVerification: { email: string; flow: 'signup' | 'forgot'; name?: string; role?: 'freelancer' | 'hiring' | 'requester'; password?: string };
    ForgotPassword: undefined;
    ResetPassword: { email: string; otp: string };
    Home: undefined;
    Main: undefined;
    ProfileSetup: undefined;
    Chat: { id: string };
    JobDetail: { id: string };
    CreateJob: undefined;
    MyJobs: undefined;
    JobPreview: { title: string; description: string; budget: string; budgetType: string; deadline: string; category: string; location: string; isRemote: boolean };
    Applicants: { jobId: string };
    HireConfirm: { applicantId: string; jobId: string };
    FreelancerProfile: { id: string };
    Search: undefined;
    FilterModal: undefined;
    CreatePost: undefined;
    PostComments: { postId: string; postOwnerId: string; caption: string; userName: string; userAvatar?: string; likesCount: number };
    Settings: undefined;
    EditProfile: undefined;
    /** Freelancer network lists */
    FollowList: { mode: "following" | "followers" };
    Referral: undefined;
    Ratings: undefined;
    Notifications: undefined;
    Help: undefined;
    Terms: undefined;
    Report: undefined;
    NewChat: undefined;
    MessageSettings: undefined;
    SearchMessages: undefined;
    Messages: undefined;
    UserProfile: { userId: string };
    StatusViewer: { statuses: IStatus[]; initialIndex: number };
};

export interface IStatusViewer {
    userId: string;
    userName: string;
    userAvatar?: string;
    viewedAt: number; // Unix timestamp in ms
}

export interface IStatus {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    imageUri: string;
    createdAt: number; // Unix timestamp in ms
    viewed: boolean;
    /** List of users who have viewed this status, newest first */
    viewers?: IStatusViewer[];
}
