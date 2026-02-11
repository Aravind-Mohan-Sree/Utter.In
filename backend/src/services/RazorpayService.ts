import { IPaymentService } from '~service-interfaces/IPaymentService';
import { razorpayInstance } from '~config/razorpay';
import crypto from 'crypto';
import { env } from '~config/env';

export class RazorpayService implements IPaymentService {
  async createOrder(amount: number, currency: string, receipt: string) {
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt,
    };
    const order = await razorpayInstance.orders.create(options);
    return {
      id: order.id,
      currency: order.currency,
      amount: Number(order.amount),
    };
  }

  verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    const hmac = crypto.createHmac('sha256', env.RAZORPAY_KEY_SECRET);
    hmac.update(orderId + '|' + paymentId);
    const generatedSignature = hmac.digest('hex');
    return generatedSignature === signature;
  }
}
