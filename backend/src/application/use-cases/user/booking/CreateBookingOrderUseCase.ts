import { IPaymentService } from '~service-interfaces/IPaymentService';
import { ISessionRepository } from '~repository-interfaces/ISessionRepository';
import { ICreateBookingOrderUseCase } from '~use-case-interfaces/user/IBookingUseCase';
import { BadRequestError } from '~errors/HttpError';
import { IRedisService } from '~service-interfaces/IRedisService';

export class CreateBookingOrderUseCase implements ICreateBookingOrderUseCase {
  constructor(
    private _paymentService: IPaymentService,
    private _sessionRepository: ISessionRepository,
    private _redisService: IRedisService,
  ) { }

  async execute(amount: number, currency: string, sessionId: string, userId: string) {
    const session = await this._sessionRepository.findOneById(sessionId);

    if (!session) {
      throw new BadRequestError('Session not found');
    }

    if (session.status !== 'Available') {
      throw new BadRequestError('This session is no longer available for booking');
    }

    const isReserved = await this._redisService.setNx(`booking:pending:${sessionId}`, userId, 300); // 5 minutes

    if (!isReserved) {
      const existingReserver = await this._redisService.get(`booking:pending:${sessionId}`);
      if (existingReserver !== userId) {
        throw new BadRequestError("Can't book right now, try after sometime.");
      }
    }

    return this._paymentService.createOrder(amount, currency, `receipt_session_${sessionId}`);
  }
}
