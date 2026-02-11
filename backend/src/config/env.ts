import dotenv from 'dotenv';
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGO_CONNECTION_URI:
    process.env.MONGO_CONNECTION_URI ||
    'mongodb://localhost:27017/utter_web_app',
  NODEMAILER_USER: process.env.NODEMAILER_USER || '',
  NODEMAILER_PASS: process.env.NODEMAILER_PASS || '',
  NODEMAILER_HOST: process.env.NODEMAILER_HOST || '',
  NODEMAILER_PORT: process.env.NODEMAILER_PORT || '',
  JWT_ALGORITHM: process.env.JWT_ALGORITHM || '',
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || '',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || '',
  RESET_TOKEN_SECRET: process.env.RESET_TOKEN_SECRET || '',
  ACCESS_TOKEN_AGE: process.env.ACCESS_TOKEN_AGE || '',
  REFRESH_TOKEN_AGE: process.env.REFRESH_TOKEN_AGE || '',
  RESET_TOKEN_AGE: process.env.RESET_TOKEN_AGE || '',
  OTP_AGE: process.env.OTP_AGE || '',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_USER_CALLBACK_URL: process.env.GOOGLE_USER_CALLBACK_URL || '',
  GOOGLE_TUTOR_CALLBACK_URL: process.env.GOOGLE_TUTOR_CALLBACK_URL || '',
  SESSION_SECRET: process.env.SESSION_SECRET || '',
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || '',
  FRONTEND_URL: process.env.FRONTEND_URL || '',
  AWS_REGION: process.env.AWS_REGION || '',
  AWS_BUCKET: process.env.AWS_BUCKET || '',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
};
