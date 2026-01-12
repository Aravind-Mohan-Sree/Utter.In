import { Document, model, Schema } from 'mongoose';

export interface IAdmin extends Document {
  name: string;
  email: string;
  role: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<IAdmin>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
);

export const AdminModel = model<IAdmin>('admins', adminSchema);
