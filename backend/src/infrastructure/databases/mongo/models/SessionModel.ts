import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
    tutorId: mongoose.Types.ObjectId;
    scheduledAt: Date;
    duration: number;
    language: string;
    topic: string;
    price: number;
    status: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    tutorId: { type: Schema.Types.ObjectId, ref: 'tutors', required: true },
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, required: true },
    language: { type: String, required: true },
    topic: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: String, required: true, default: 'Available' },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true },
);

export const SessionModel = mongoose.model<ISession>('sessions', sessionSchema);
