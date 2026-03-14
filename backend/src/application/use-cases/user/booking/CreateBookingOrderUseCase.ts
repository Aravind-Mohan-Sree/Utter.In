import { IPaymentService } from '~service-interfaces/IPaymentService';
import { ISessionRepository } from '~repository-interfaces/ISessionRepository';
import { ICreateBookingOrderUseCase } from '~use-case-interfaces/user/IBookingUseCase';
import { BadRequestError } from '~errors/HttpError';

export class CreateBookingOrderUseCase implements ICreateBookingOrderUseCase {
  constructor(
    private _paymentService: IPaymentService,
    private _sessionRepository: ISessionRepository,
  ) { }

  async execute(amount: number, currency: string, sessionId: string) {
    const session = await this._sessionRepository.findOneById(sessionId);

    if (!session) {
      throw new BadRequestError('Session not found');
    }

    if (session.status !== 'Available') {
      throw new BadRequestError('This session is no longer available for booking');
    }

    return this._paymentService.createOrder(amount, currency, `receipt_session_${sessionId}`);
  }
}
