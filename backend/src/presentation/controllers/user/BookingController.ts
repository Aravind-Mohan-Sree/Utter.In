import { Request, Response, NextFunction } from 'express';
import { CreateBookingOrderUseCase } from '~use-cases/user/booking/CreateBookingOrderUseCase';
import { VerifyPaymentAndBookUseCase } from '~use-cases/user/booking/VerifyPaymentAndBookUseCase';
import { httpStatusCode } from '~constants/httpStatusCode';
import { successMessage } from '~constants/successMessage';
import { logger } from '~logger/logger';

export class BookingController {
  constructor(
        private createBookingOrderUC: CreateBookingOrderUseCase,
        private verifyPaymentAndBookUC: VerifyPaymentAndBookUseCase,
  ) { }

  createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { amount, currency, sessionId } = req.body;
      const order = await this.createBookingOrderUC.execute(amount, currency, sessionId);
      res.status(httpStatusCode.OK).json({
        success: true,
        message: successMessage.ORDER_CREATED,
        order,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        sessionId,
        tutorId,
        amount,
        currency,
      } = req.body;
            interface AuthenticatedRequest extends Request {
                user?: {
                    id?: string;
                    _id?: string;
                }
            }

            const user = (req as AuthenticatedRequest).user;
            const userId = user?.id || user?._id;

            if (!userId) {
              res.status(httpStatusCode.UNAUTHORIZED).json({ success: false, message: 'User not authenticated' });
              return;
            }

            const booking = await this.verifyPaymentAndBookUC.execute({
              orderId,
              paymentId,
              signature,
              sessionId,
              userId,
              tutorId,
              amount,
              currency,
            });

            res.status(httpStatusCode.OK).json({
              success: true,
              message: successMessage.BOOKING_SUCCESS,
              booking,
            });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
