import mongoose, { Document, Schema } from 'mongoose';

export interface ITutor extends Document {
  name: string;
  email: string;
  knownLanguages: string[];
  yearsOfExperience: string;
  bio: string;
  password: string;
  role: string;
  isBlocked: boolean;
  isVerified: boolean;
  certificationType: string[];
  pendingLanguages: string[];
  pendingCertification: string | null;
  languageVerificationStatus: 'pending' | 'approved' | 'rejected' | null;
  rejectionReason: string | null;
  certificates: string[];
  googleId: string | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const tutorSchema = new Schema<ITutor>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    knownLanguages: { type: [String], required: true },
    yearsOfExperience: { type: String, required: true },
    bio: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    isBlocked: { type: Boolean, required: true, default: false },
    isVerified: { type: Boolean, required: true, default: false },
    certificationType: { type: [String], default: [] },
    pendingLanguages: { type: [String], default: [] },
    pendingCertification: { type: String, default: null },
    languageVerificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', null],
      default: null,
    },
    rejectionReason: { type: String, default: null },
    certificates: { type: [String], default: [] },
    googleId: { type: String, default: null },
    expiresAt: { type: Date, default: null, expires: 604800 },
  },
  { timestamps: true },
);

export const TutorModel = mongoose.model<ITutor>('tutors', tutorSchema);
