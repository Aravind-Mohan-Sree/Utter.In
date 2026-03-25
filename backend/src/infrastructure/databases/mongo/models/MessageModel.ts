import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  text: string;
  isRead: boolean;
  isDeleted: boolean;
  isEdited: boolean;
  hiddenBy: mongoose.Types.ObjectId[];
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'conversations',
      required: true,
    },
    senderId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    text: { type: String, default: '' },
    fileUrl: { type: String, default: null },
    fileType: { type: String, default: null },
    fileName: { type: String, default: null },
    isRead: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
    hiddenBy: [{ type: Schema.Types.ObjectId, ref: 'users', default: [] }],
  },
  { timestamps: true },
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

export const MessageModel = mongoose.model<IMessage>('messages', messageSchema);
