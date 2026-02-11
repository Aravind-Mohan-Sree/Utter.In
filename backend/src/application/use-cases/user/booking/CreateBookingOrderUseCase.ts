import { IPaymentService } from '~service-interfaces/IPaymentService';
import { ICreateBookingOrderUseCase } from '~use-case-interfaces/user/IBookingUseCase';

export class CreateBookingOrderUseCase implements ICreateBookingOrderUseCase {
  constructor(private paymentService: IPaymentService) { }

  async execute(amount: number, currency: string, sessionId: string) {
    return this.paymentService.createOrder(amount, currency, `receipt_session_${sessionId}`);
  }
}
