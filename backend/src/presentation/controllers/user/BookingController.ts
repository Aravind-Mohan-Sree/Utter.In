import { Request, Response, NextFunction } from 'express';
import { CreateBookingOrderUseCase } from '~use-cases/user/booking/CreateBookingOrderUseCase';
import { VerifyPaymentAndBookUseCase } from '~use-cases/user/booking/VerifyPaymentAndBookUseCase';
import { GetBookingsUseCase } from '~use-cases/shared/GetBookingsUseCase';
import { CancelBookingUseCase } from '~use-cases/shared/CancelBookingUseCase';
import { httpStatusCode } from '~constants/httpStatusCode';
import { successMessage } from '~constants/successMessage';
import { logger } from '~logger/logger';
import { GetBookingsDTO } from '~dtos/GetBookingsDTO';

interface IAuthenticatedRequest extends Request {
  user: {
    id: string;
    role: 'user' | 'tutor' | 'admin';
  };
}

export class BookingController {
  constructor(
    private createBookingOrderUC: CreateBookingOrderUseCase,
    private verifyPaymentAndBookUC: VerifyPaymentAndBookUseCase,
    private getBookingsUC: GetBookingsUseCase,
    private cancelBookingUC: CancelBookingUseCase,
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

      const booking = await this.verifyPaymentAndBookUC.execute({
        orderId,
        paymentId,
        signature,
        sessionId,
        userId: userId as string,
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

  getBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as unknown as IAuthenticatedRequest).user;

      const isTutor = user.role === 'tutor';
      const userId = isTutor ? undefined : user.id;
      const tutorId = isTutor ? user.id : undefined;

      const requestDTO = new GetBookingsDTO({
        ...req.query as Record<string, string>,
        userId,
        tutorId,
      });

      const response = await this.getBookingsUC.execute(requestDTO);

      res.status(httpStatusCode.OK).json({
        success: true,
        ...response,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = (req as unknown as IAuthenticatedRequest).user;

      await this.cancelBookingUC.execute(id, user.id, user.role);

      res.status(httpStatusCode.OK).json({
        success: true,
        message: 'Booking cancelled successfully',
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
