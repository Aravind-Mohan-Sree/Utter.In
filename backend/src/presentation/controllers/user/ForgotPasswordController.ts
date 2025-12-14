import { NextFunction, Request, Response } from 'express';
import {
  IForgotPasswordOtpVerifyUseCase,
  IForgotPasswordUseCase,
  IResetPasswordUseCase,
} from '~use-case-interfaces/shared/IForgotPasswordUseCase';
import { ISendOtpUseCase } from '~use-case-interfaces/shared/IOtpUseCase';
import { env } from '~config/env';
import { cookieData } from '~constants/cookieData';
import { httpStatusCode } from '~constants/httpStatusCode';
import { successMessage } from '~constants/successMessage';
import { IValidateDataService } from '~service-interfaces/IValidateDataService';
import { BadRequestError } from '~errors/HttpError';
import { logger } from '~logger/logger';

export class ForgotPasswordController {
  constructor(
    private forgotPassword: IForgotPasswordUseCase,
    private sendOtp: ISendOtpUseCase,
    private forgotPassOtpVerify: IForgotPasswordOtpVerifyUseCase,
    private validator: IValidateDataService,
    private resetPasswordUC: IResetPasswordUseCase,
  ) {}

  registerForgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { email } = req.body;
      const validatedEmail = this.validator.validateEmail(email);

      if (!validatedEmail.success)
        throw new BadRequestError(validatedEmail.message);

      await this.forgotPassword.execute(email);
      await this.sendOtp.execute(email);

      const isProduction = env.NODE_ENV === 'production';
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : ('strict' as 'strict' | 'none'),
        maxAge: cookieData.OTP_AGE,
        domain: isProduction ? env.COOKIE_DOMAIN : undefined,
        path: '/',
      };

      res.cookie('otp', Date.now(), cookieOptions);

      res
        .status(httpStatusCode.CREATED)
        .json({ message: successMessage.OTP_SENDED });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  ForgotPasswordOtpVerify = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { email, otp } = req.body;
      const validatedEmail = this.validator.validateEmail(email);
      const validatedOtp = this.validator.validateOtp(otp);

      if (!validatedEmail.success)
        throw new BadRequestError(validatedEmail.message);
      if (!validatedOtp.success)
        throw new BadRequestError(validatedOtp.message);

      const resetToken = await this.forgotPassOtpVerify.execute(email, otp);
      const isProduction = env.NODE_ENV === 'production';

      res.cookie('resetToken', resetToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'strict',
        maxAge: cookieData.RESET_TOKEN_AGE,
        domain: isProduction ? env.COOKIE_DOMAIN : undefined,
        path: '/',
      });

      res.status(httpStatusCode.OK).json({
        message: successMessage.OTP_VERIFIED,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { password } = req.body;
      const { resetToken } = req.cookies;
      const validatedPassword = this.validator.validatePassword(password);

      if (!validatedPassword.success)
        throw new BadRequestError(validatedPassword.message);

      await this.resetPasswordUC.execute(resetToken, password);

      const isProduction = env.NODE_ENV === 'production';

      res.clearCookie('resetToken', {
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'strict',
        secure: isProduction,
        domain: isProduction ? env.COOKIE_DOMAIN : undefined,
        path: '/',
      });

      res.status(httpStatusCode.OK).json({
        message: successMessage.PASSWORD_RESET_SUCCESS,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
