import { NextFunction, Request, Response } from 'express';
import {
  ISendOtpUseCase,
  IVerifyOtpUseCase,
} from '~use-case-interfaces/shared/IOtpUseCase';
import { IRegisterTutorFromPendingUseCase } from '~use-case-interfaces/tutor/ITutorUseCase';
import { env } from '~config/env';
import { httpStatusCode } from '~constants/httpStatusCode';
import { successMessage } from '~constants/successMessage';
import { logger } from '~logger/logger';
import { IUpdateFileUseCase } from '~use-case-interfaces/shared/IFileUseCase';
import { contentTypes, filePrefixes } from '~constants/fileConstants';

export class OtpController {
  constructor(
    private _verifyOtp: IVerifyOtpUseCase,
    private _sendOtp: ISendOtpUseCase,
    private _registerTutorFromPending: IRegisterTutorFromPendingUseCase,
    private _updateFile: IUpdateFileUseCase,
  ) {}

  verify = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { otp, email } = req.body;

      await this._verifyOtp.execute(email, otp);

      const data = await this._registerTutorFromPending.execute(email);

      await this._updateFile.execute(
        filePrefixes.TEMP_TUTOR_VIDEO,
        filePrefixes.TUTOR_VIDEO,
        data.pendingTutorId,
        data.newTutorId,
        contentTypes.VIDEO_MP4,
      );
      await this._updateFile.execute(
        filePrefixes.TEMP_TUTOR_CERTIFICATE,
        filePrefixes.TUTOR_CERTIFICATE,
        data.pendingTutorId,
        data.newTutorId,
        contentTypes.APPLICATION_PDF,
      );

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
