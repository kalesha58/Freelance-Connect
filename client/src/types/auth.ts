/**
 * Represents the available user roles in the platform.
 */
export type UserRole = 'freelancer' | 'requester' | 'hiring';

/**
 * Interface defining user properties.
 */
export interface IUser {
    name: string;
    email: string;
    role: UserRole | null;
    bio?: string;
    earnings?: number;
    projectsCompleted?: number;
    followers?: number;
    following?: number;
    rating?: number;
    skills?: string[];
}

/**
 * Interface defining login payload.
 */
export interface ILoginPayload {
    email: string;
    role: UserRole;
}

/**
 * Interface defining signup payload.
 */
export interface ISignupPayload {
    name: string;
    email: string;
    role: UserRole | null;
}
