import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  MONGO_CONNECTION_URI: process.env.MONGO_CONNECTION_URI || 'mongodb://localhost:27017/utter_web_app',
};