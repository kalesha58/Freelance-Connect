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
    portfolioItems?: IPortfolioItem[];
    freelancerReviews?: IFreelancerReview[];
    isAvailableForHire?: boolean;
    role?: string;
}
