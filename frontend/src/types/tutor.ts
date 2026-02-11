export interface Tutor {
    id: string;
    name: string;
    email: string;
    knownLanguages: string[];
    yearsOfExperience: string;
    bio: string;
    role: string;
    isBlocked: boolean;
    isVerified: boolean;
    certificationType: string;
    rejectionReason: string | null;
    createdAt: string;
}

export interface Session {
    id: string;
    tutorId: string;
    scheduledAt: string;
    duration: number;
    language: string;
    topic: string;
    price: number;
    status: string;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface GetTutorDetailsResponse {
    message: string;
    tutor: Tutor;
}

export interface GetTutorSessionsResponse {
    message: string;
    sessions: Session[];
}
