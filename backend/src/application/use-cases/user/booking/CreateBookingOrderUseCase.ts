import { IPaymentService } from '~service-interfaces/IPaymentService';
import { ISessionRepository } from '~repository-interfaces/ISessionRepository';
import { ICreateBookingOrderUseCase } from '~use-case-interfaces/user/IBookingUseCase';
import { BadRequestError } from '~errors/HttpError';

export class CreateBookingOrderUseCase implements ICreateBookingOrderUseCase {
  constructor(
    private paymentService: IPaymentService,
    private sessionRepository: ISessionRepository,
  ) { }

  async execute(amount: number, currency: string, sessionId: string) {
    const session = await this.sessionRepository.findOneById(sessionId);

    if (!session) {
      throw new BadRequestError('Session not found');
    }

    if (session.status !== 'Available') {
      throw new BadRequestError('This session is no longer available for booking');
    }

    return this.paymentService.createOrder(amount, currency, `receipt_session_${sessionId}`);
  }
}
