import { NextFunction, Request, Response } from 'express';
import { ISendOtpUseCase, IVerifyOtpUseCase } from '~application-interfaces/user/IOtpUseCase';
import { IRegisterUserFromPendingUseCase } from '~application-interfaces/user/IUserUseCase';
import { httpStatusCode } from '~constants/httpStatusCode';
import { successMessage } from '~constants/successMessage';
import { logger } from '~logger/logger';

export class OtpController {
  constructor(
    private verifyOtp: IVerifyOtpUseCase,
    private sendOtp: ISendOtpUseCase,
    private registerUserFromPending: IRegisterUserFromPendingUseCase,
  ) {}

  verify = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { otp, email } = req.body;

      await this.verifyOtp.execute(email, otp);

      const user = await this.registerUserFromPending.execute(email);

      res
        .status(httpStatusCode.OK)
        .json({ message: successMessage.SIGNUP_SUCCESS, user });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  resend = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      await this.sendOtp.execute(email);

      res
        .status(httpStatusCode.OK)
        .json({ message: successMessage.OTP_SENDED });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
