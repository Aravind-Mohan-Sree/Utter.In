import mongoose, { Document, Schema } from 'mongoose';

export interface IPendingUser extends Document {
  name: string;
  email: string;
  knownLanguages: string[];
  password: string;
  otp?: string;
  createdAt: Date;
  updatedAt: Date;
}

const pendingUserSchema = new Schema<IPendingUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    knownLanguages: { type: [String], required: true },
    password: { type: String, required: true },
    otp: { type: String },
    createdAt: { type: Date, default: Date.now, expires: 300 },
  },
  { timestamps: true },
);

export const PendingUserModel = mongoose.model('pendingUsers', pendingUserSchema);
