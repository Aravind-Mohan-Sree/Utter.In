import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  knownLanguages: string[];
  bio: string;
  password: string;
  role: string;
  isBlocked: boolean;
  googleId: string;
  streak: {
    lastActive: Date;
    currentStreak: number;
    highestStreak: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    knownLanguages: { type: [String], required: true },
    bio: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    isBlocked: { type: Boolean, required: true },
    googleId: { type: String },
    streak: {
      lastActive: { type: Date },
      currentStreak: { type: Number },
      highestStreak: { type: Number },
    },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model<IUser>('users', userSchema);
