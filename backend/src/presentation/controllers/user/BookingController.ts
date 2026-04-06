import { Request, Response, NextFunction } from 'express';
import { IPingBookingUseCase } from '~use-case-interfaces/shared/IPingBookingUseCase';
import { httpStatusCode } from '~constants/httpStatusCode';
import { successMessage } from '~constants/successMessage';
import { logger } from '~logger/logger';
import { GetBookingsDTO } from '~dtos/GetBookingsDTO';
import { ICancelBookingUseCase } from '~use-case-interfaces/shared/ICancelBookingUseCase';
import { IGetBookingsUseCase } from '~use-case-interfaces/shared/IGetBookingsUseCase';
import { ICreateBookingOrderUseCase, IVerifyPaymentAndBookUseCase } from '~use-case-interfaces/user/IBookingUseCase';

interface IAuthenticatedRequest extends Request {
  user: {
    id: string;
    role: 'user' | 'tutor' | 'admin';
  };
}

export class BookingController {
  constructor(
    private _createBookingOrderUC: ICreateBookingOrderUseCase,
    private _verifyPaymentAndBookUC: IVerifyPaymentAndBookUseCase,
    private _getBookingsUC: IGetBookingsUseCase,
    private _cancelBookingUC: ICancelBookingUseCase,
    private _pingBookingUC: IPingBookingUseCase,
  ) { }

  createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { amount, currency, sessionId } = req.body;
      const user = (req as unknown as IAuthenticatedRequest).user;
      const order = await this._createBookingOrderUC.execute(amount, currency, sessionId, user.id);
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

      const booking = await this._verifyPaymentAndBookUC.execute({
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

      const response = await this._getBookingsUC.execute(requestDTO);

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

      await this._cancelBookingUC.execute(id, user.id, user.role);

      res.status(httpStatusCode.OK).json({
        success: true,
        message: 'Booking cancelled successfully',
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  pingSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = (req as unknown as IAuthenticatedRequest).user;

      const response = await this._pingBookingUC.execute(id, user.role);

      res.status(httpStatusCode.OK).json({
        success: true,
        completed: response.completed,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
