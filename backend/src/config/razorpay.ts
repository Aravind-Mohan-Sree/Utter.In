import Razorpay from 'razorpay';
import { env } from '~config/env';

let _instance: Razorpay | null = null;

export const getRazorpayInstance = (): Razorpay => {
  if (!_instance) {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay keys are missing in environment configuration.');
    }
    
    _instance = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }
  return _instance;
};
