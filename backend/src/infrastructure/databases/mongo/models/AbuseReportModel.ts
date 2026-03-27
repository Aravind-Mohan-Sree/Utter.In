import mongoose, { Schema, Document } from 'mongoose';

export interface IAbuseReport extends Document {
  reporterId: mongoose.Types.ObjectId;
  reportedId: mongoose.Types.ObjectId;
  type: string;
  description: string;
  messages: {
    senderId: mongoose.Types.ObjectId;
    text?: string;
    timestamp: Date;
    fileUrl?: string;
    fileType?: string;
    fileName?: string;
  }[];
  channel: 'chat' | 'video';
  status: 'Pending' | 'Resolved' | 'Rejected';
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AbuseReportSchema: Schema = new Schema(
  {
    reporterId: { type: Schema.Types.ObjectId, required: true },
    reportedId: { type: Schema.Types.ObjectId, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    messages: [
      {
        senderId: { type: Schema.Types.ObjectId, required: true },
        text: { type: String, required: false },
        timestamp: { type: Date, required: true },
        fileUrl: { type: String, required: false },
        fileType: { type: String, required: false },
        fileName: { type: String, required: false },
      },
    ],
    channel: { type: String, enum: ['chat', 'video'], required: true },
    status: {
      type: String,
      enum: ['Pending', 'Resolved', 'Rejected'],
      default: 'Pending',
    },
    rejectionReason: { type: String, default: null },
  },
  { timestamps: true },
);

export const AbuseReportModel = mongoose.model<IAbuseReport>(
  'AbuseReport',
  AbuseReportSchema,
);
