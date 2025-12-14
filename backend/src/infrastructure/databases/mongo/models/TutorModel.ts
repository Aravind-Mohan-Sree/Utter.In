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
  rejectionReason: string | null;
  googleId: string | null;
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
    isBlocked: { type: Boolean, required: true },
    isVerified: { type: Boolean, required: true },
    rejectionReason: { type: String, default: null },
    googleId: { type: String, default: null },
    createdAt: { type: Date, default: Date.now, expires: 10 },
  },
  { timestamps: true },
);

export const TutorModel = mongoose.model<ITutor>('tutors', tutorSchema);
