import mongoose, { Document, Schema } from 'mongoose';

export interface IPendingUser extends Document {
  name: string;
  email: string;
  knownLanguages: string[];
  password: string;
  otp?: string;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const pendingUserSchema = new Schema<IPendingUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    knownLanguages: { type: [String], default: null },
    password: { type: String, default: null },
    otp: { type: String, default: null },
    googleId: { type: String, default: null },
    updatedAt: { type: Date, default: Date.now, expires: 120 },
  },
  { timestamps: true },
);

export const PendingUserModel = mongoose.model(
  'pendingUsers',
  pendingUserSchema,
);
