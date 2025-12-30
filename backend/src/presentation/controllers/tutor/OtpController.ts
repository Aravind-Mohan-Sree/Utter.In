import { NextFunction, Request, Response } from 'express';
import {
  ISendOtpUseCase,
  IVerifyOtpUseCase,
} from '~use-case-interfaces/shared/IOtpUseCase';
import {
  IRegisterTutorFromPendingUseCase,
  IUpdateTutorFilesUseCase,
} from '~use-case-interfaces/tutor/ITutorUseCase';
import { env } from '~config/env';
import { cookieData } from '~constants/cookieData';
import { httpStatusCode } from '~constants/httpStatusCode';
import { successMessage } from '~constants/successMessage';
import { logger } from '~logger/logger';

export class OtpController {
  constructor(
    private verifyOtp: IVerifyOtpUseCase,
    private sendOtp: ISendOtpUseCase,
    private registerTutorFromPending: IRegisterTutorFromPendingUseCase,
    private updateTutorFiles: IUpdateTutorFilesUseCase,
  ) {}

  verify = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { otp, email } = req.body;

      await this.verifyOtp.execute(email, otp);

      const data = await this.registerTutorFromPending.execute(email);

      await this.updateTutorFiles.execute(data.pendingTutorId, data.newTutorId);

      res
        .status(httpStatusCode.OK)
        .json({ message: successMessage.SIGNUP_SUCCESS, tutor: data.tutor });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  resend = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      await this.sendOtp.execute(email);

      const isProduction = env.NODE_ENV === 'production';
      const cookieOptions = {
        secure: isProduction,
        sameSite: isProduction ? 'none' : ('strict' as 'strict' | 'none'),
        maxAge: cookieData.OTP_AGE,
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
