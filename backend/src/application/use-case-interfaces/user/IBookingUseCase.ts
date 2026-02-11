import { BookingResponseDTO } from '~mappers/BookingMapper';

export interface ICreateBookingOrderUseCase {
    execute(amount: number, currency: string, sessionId: string): Promise<{
        id: string;
        currency: string;
        amount: number;
    }>;
}

export interface IVerifyPaymentAndBookUseCase {
    execute(data: {
        orderId: string;
        paymentId: string;
        signature: string;
        sessionId: string;
        userId: string;
        tutorId: string;
        amount: number;
        currency: string;
    }): Promise<BookingResponseDTO | null>;
}
