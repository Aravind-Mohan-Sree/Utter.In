import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  sessionId: string;
  userId: string;
  tutorId: string;
  payment: {
    provider: string;
    transactionId: string;
    status: string;
    currency: string;
  };
  status: string;
  refundStatus: string;
  cancelledAt: Date | null;
  activeSeconds: number;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    sessionId: { type: String, required: true },
    userId: { type: String, required: true },
    tutorId: { type: String, required: true },
    payment: {
      provider: { type: String, required: true },
      transactionId: { type: String, required: true },
      status: { type: String, required: true },
      currency: { type: String, required: true },
    },
    status: { type: String, required: true },
    refundStatus: { type: String, required: true },
    cancelledAt: { type: Date, default: null },
    activeSeconds: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

export const BookingModel = mongoose.model<IBooking>('Booking', bookingSchema);
