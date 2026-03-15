import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  tutorId: mongoose.Types.ObjectId;
  rating: number;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    tutorId: { type: Schema.Types.ObjectId, ref: 'tutors', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    note: { type: String, required: true },
  },
  { timestamps: true },
);

ReviewSchema.index({ userId: 1, tutorId: 1 }, { unique: true });

export default mongoose.model<IReview>('Review', ReviewSchema);
