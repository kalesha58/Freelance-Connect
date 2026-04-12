export interface IPortfolioItem {
    title?: string;
    imageUrl?: string;
    link?: string;
}

export interface IFreelancerReview {
    clientName: string;
    rating: number;
    comment?: string;
    createdAt?: string;
}

export interface IEducationEntry {
    institution?: string;
    degree?: string;
    startYear?: string;
    endYear?: string;
}

export interface IExperienceEntry {
    company?: string;
    role?: string;
    startYear?: string;
    endYear?: string;
    description?: string;
}

export interface IPublicFreelancerProfile {
    _id: string;
    name: string;
    tagline?: string;
    bio?: string;
    avatar?: string;
    profilePic?: string;
    location?: string;
    rating?: number;
    hourlyRate?: number;
    skills?: string[];
    projectsCompleted?: number;
    followers?: number;
    /** External portfolio URL */
    portfolioUrl?: string;
    education?: IEducationEntry[];
    experience?: IExperienceEntry[];
    portfolioItems?: IPortfolioItem[];
    freelancerReviews?: IFreelancerReview[];
    isAvailableForHire?: boolean;
    role?: string;
}
