import { IPaymentService } from '~service-interfaces/IPaymentService';
import { ISessionRepository } from '~repository-interfaces/ISessionRepository';
import { ICreateBookingOrderUseCase } from '~use-case-interfaces/user/IBookingUseCase';
import { BadRequestError } from '~errors/HttpError';
import { IRedisService } from '~service-interfaces/IRedisService';

/**
 * Use case to initiate a booking process by creating a payment order.
 * Ensures the session is available and implements a reservation lock in Redis.
 */
export class CreateBookingOrderUseCase implements ICreateBookingOrderUseCase {
  constructor(
    private _paymentService: IPaymentService,
    private _sessionRepository: ISessionRepository,
    private _redisService: IRedisService,
  ) { }

  /**
   * Creates a payment order and reserves the session temporarily.
   * @param amount The payment amount.
   * @param currency The currency (e.g., INR).
   * @param sessionId The session to be booked.
   * @param userId The user initiating the booking.
   */
  async execute(amount: number, currency: string, sessionId: string, userId: string) {
    const session = await this._sessionRepository.findOneById(sessionId);

    if (!session) {
      throw new BadRequestError('Session not found');
    }

    // Only 'Available' sessions can be booked
    if (session.status !== 'Available') {
      throw new BadRequestError('This session is no longer available for booking');
    }

    // Implement a 5-minute reservation lock in Redis to prevent concurrent booking attempts
    const isReserved = await this._redisService.setNx(`booking:pending:${sessionId}`, userId, 300); // 5 minutes

    if (!isReserved) {
      // Check if the current user is the one who already holds the reservation
      const existingReserver = await this._redisService.get(`booking:pending:${sessionId}`);
      if (existingReserver !== userId) {
        throw new BadRequestError("Can't book right now, try after sometime.");
      }
    }

    // Create the actual payment order via the payment service (e.g., Razorpay)
    return this._paymentService.createOrder(amount, currency, `receipt_session_${sessionId}`);
  }
}
