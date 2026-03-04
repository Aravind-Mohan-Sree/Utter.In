import mongoose, { Document, Schema } from 'mongoose';

export interface IWallet extends Document {
    userId: mongoose.Types.ObjectId;
    balance: number;
    currency: string;
    transactions: {
        amount: number;
        type: 'credit' | 'debit';
        description: string;
        date: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const walletSchema = new Schema<IWallet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true, unique: true },
    balance: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true, default: 'INR' },
    transactions: [
      {
        amount: { type: Number, required: true },
        type: { type: String, enum: ['credit', 'debit'], required: true },
        description: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

export const WalletModel = mongoose.model<IWallet>('wallets', walletSchema);
