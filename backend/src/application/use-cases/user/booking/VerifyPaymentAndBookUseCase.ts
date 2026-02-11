import { Booking } from '~entities/Booking';
import { IBookingRepository } from '~repository-interfaces/IBookingRepository';
import { ISessionRepository } from '~repository-interfaces/ISessionRepository';
import { IPaymentService } from '~service-interfaces/IPaymentService';
import { IVerifyPaymentAndBookUseCase } from '~use-case-interfaces/user/IBookingUseCase';
import { BadRequestError } from '~errors/HttpError';
import { BookingMapper, BookingResponseDTO } from '~mappers/BookingMapper';

export class VerifyPaymentAndBookUseCase implements IVerifyPaymentAndBookUseCase {
  constructor(
        private bookingRepository: IBookingRepository,
        private sessionRepository: ISessionRepository,
        private paymentService: IPaymentService,
  ) { }

  async execute(data: {
        orderId: string;
        paymentId: string;
        signature: string;
        sessionId: string;
        userId: string;
        tutorId: string;
        amount: number;
        currency: string;
    }): Promise<BookingResponseDTO | null> {
    const isValid = this.paymentService.verifySignature(data.orderId, data.paymentId, data.signature);

    if (!isValid) {
      throw new BadRequestError('Invalid payment signature');
    }

    const booking = new Booking(
      data.sessionId,
      data.userId,
      data.tutorId,
      {
        provider: 'razorpay',
        transactionId: data.paymentId,
        status: 'success',
        currency: data.currency,
      },
      'confirmed',
      'none',
      null,
    );

    const savedBooking = await this.bookingRepository.create(booking);

    await this.sessionRepository.updateOneById(data.sessionId, { status: 'Booked' });

    return BookingMapper.toResponse(savedBooking);
  }
}
