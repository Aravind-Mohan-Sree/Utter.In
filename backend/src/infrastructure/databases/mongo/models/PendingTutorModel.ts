import mongoose, { Document, Schema } from 'mongoose';

export interface IPendingTutor extends Document {
  name: string;
  email: string;
  knownLanguages: string[];
  yearsOfExperience: string;
  password: string;
  otp?: string;
  createdAt: Date;
  updatedAt: Date;
}

const pendingTutorSchema = new Schema<IPendingTutor>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    knownLanguages: { type: [String], default: null },
    yearsOfExperience: { type: String, default: null },
    password: { type: String, default: null },
    otp: { type: String, default: null },
    updatedAt: { type: Date, default: Date.now, expires: 120 },
  },
  { timestamps: true },
);

export const PendingTutorModel = mongoose.model(
  'pendingTutors',
  pendingTutorSchema,
);
