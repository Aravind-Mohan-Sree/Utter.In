import dotenv from 'dotenv';
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGO_CONNECTION_URI:
    process.env.MONGO_CONNECTION_URI ||
    'mongodb://localhost:27017/utter_web_app',
  APP_EMAIL: process.env.APP_EMAIL || '',
  GOOGLE_APP_PASSWORD: process.env.GOOGLE_APP_PASSWORD || '',
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || '',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || '',
  RESET_TOKEN_SECRET: process.env.RESET_TOKEN_SECRET || '',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || '',
  SESSION_SECRET: process.env.SESSION_SECRET || '',
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || '',
  FRONTEND_URL: process.env.FRONTEND_URL || '',
};
