import { IPaymentService } from '~service-interfaces/IPaymentService';
import { razorpayInstance } from '~config/razorpay';
import crypto from 'crypto';
import { env } from '~config/env';

/**
 * Concrete implementation of IPaymentService using Razorpay.
 * Handles order creation and signature verification for secure payments.
 */
export class RazorpayService implements IPaymentService {
  /**
   * Creates a new Razorpay order.
   * @param amount Amount in standard currency unit (e.g., Rupees).
   * @param currency ISO currency code.
   * @param receipt Unique identifier for the transaction.
   */
  async createOrder(amount: number, currency: string, receipt: string) {
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise (Rupees * 100)
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

  /**
   * Verifies the authenticity of a payment by checking the Razorpay signature.
   */
  verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    const hmac = crypto.createHmac('sha256', env.RAZORPAY_KEY_SECRET);
    hmac.update(orderId + '|' + paymentId);
    const generatedSignature = hmac.digest('hex');
    return generatedSignature === signature;
  }
}
