export interface IPaymentService {
    createOrder(amount: number, currency: string, receipt: string): Promise<{
        id: string;
        currency: string;
        amount: number;
    }>;
    verifySignature(orderId: string, paymentId: string, signature: string): boolean;
}
