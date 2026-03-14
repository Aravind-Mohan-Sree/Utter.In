import { NextFunction, Request, Response } from 'express';
import {
  ISendOtpUseCase,
  IVerifyOtpUseCase,
} from '~use-case-interfaces/shared/IOtpUseCase';
import { IRegisterUserFromPendingUseCase } from '~use-case-interfaces/user/IUserUseCase';
import { env } from '~config/env';
import { httpStatusCode } from '~constants/httpStatusCode';
import { successMessage } from '~constants/successMessage';
import { logger } from '~logger/logger';

export class OtpController {
  constructor(
    private _verifyOtp: IVerifyOtpUseCase,
    private _sendOtp: ISendOtpUseCase,
    private _registerUserFromPending: IRegisterUserFromPendingUseCase,
  ) {}

  verify = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { otp, email } = req.body;

      await this._verifyOtp.execute(email, otp);

      const user = await this._registerUserFromPending.execute(email);

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

      await this._sendOtp.execute(email);

      const isProduction = env.NODE_ENV === 'production';
      const cookieOptions = {
        secure: isProduction,
        sameSite: isProduction ? 'none' : ('strict' as 'strict' | 'none'),
        maxAge: parseInt(env.OTP_AGE),
        domain: isProduction ? env.COOKIE_DOMAIN : undefined,
        path: '/',
      };

      res.cookie('otp', Date.now(), cookieOptions);

      res
        .status(httpStatusCode.OK)
        .json({ message: successMessage.OTP_SENDED });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
