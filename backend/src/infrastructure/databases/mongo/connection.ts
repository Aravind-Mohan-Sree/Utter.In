import mongoose from 'mongoose';
import { env } from '~config/env';

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  const { MONGO_CONNECTION_URI } = env;

  if (!isConnected) await mongoose.connect(MONGO_CONNECTION_URI);

  isConnected = true;
};

export const disconnectDB = async (): Promise<void> => {
  if (isConnected) await mongoose.disconnect();

  isConnected = false;
};