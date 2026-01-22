import { NextFunction, Request, Response } from 'express';
import { RegisterUserDTO } from '~dtos/RegisterUserDTO';
import { SigninDTO } from '~dtos/SigninDTO';
import { ISendOtpUseCase } from '~use-case-interfaces/shared/IOtpUseCase';
import {
  IFinishRegisterUserUseCase,
  IRegisterUserUseCase,
  ISigninUserUseCase,
} from '~use-case-interfaces/user/IUserUseCase';
import { env } from '~config/env';
import { httpStatusCode } from '~constants/httpStatusCode';
import { successMessage } from '~constants/successMessage';
import { IValidateDataService } from '~service-interfaces/IValidateDataService';
import { logger } from '~logger/logger';
import { FinishRegisterUserDTO } from '~dtos/FinishRegisterUserDTO';
import { IUpdateFileUseCase } from '~use-case-interfaces/shared/IFileUseCase';

export class AuthController {
  constructor(
    private registerUser: IRegisterUserUseCase,
    private finishRegisterUser: IFinishRegisterUserUseCase,
    private signinUser: ISigninUserUseCase,
    private validator: IValidateDataService,
    private sendOtp: ISendOtpUseCase,
    private updateFile: IUpdateFileUseCase,
  ) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = new RegisterUserDTO(req.body, this.validator);
      const email = await this.registerUser.execute(data);

      await this.sendOtp.execute(email);

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
        .status(httpStatusCode.CREATED)
        .json({ message: successMessage.OTP_SENDED });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  finishRegister = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = new FinishRegisterUserDTO({ ...req.body }, this.validator);
      const isProduction = env.NODE_ENV === 'production';
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : ('strict' as 'strict' | 'none'),
        domain: isProduction ? env.COOKIE_DOMAIN : undefined,
        path: '/',
      };

      const userData = await this.finishRegisterUser.execute(data);

      await this.updateFile.execute(
        'temp/users/avatars/',
        'users/avatars/',
        userData.oldId,
        userData.user.id!,
        'image/jpeg',
      );

      res.cookie('accessToken', userData.accessToken, {
        ...cookieOptions,
        maxAge: parseInt(env.ACCESS_TOKEN_AGE),
      });
      res.cookie('refreshToken', userData.refreshToken, {
        ...cookieOptions,
        maxAge: parseInt(env.REFRESH_TOKEN_AGE),
      });
      res
        .status(httpStatusCode.CREATED)
        .json({ message: successMessage.SIGNUP_SUCCESS, user: userData.user });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  signin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = new SigninDTO(req.body, this.validator);
      const userData = await this.signinUser.execute(data);
      const isProduction = env.NODE_ENV === 'production';
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : ('strict' as 'strict' | 'none'),
        domain: isProduction ? env.COOKIE_DOMAIN : undefined,
        path: '/',
      };

      res.cookie('accessToken', userData.accessToken, {
        ...cookieOptions,
        maxAge: parseInt(env.ACCESS_TOKEN_AGE),
      });
      res.cookie('refreshToken', userData.refreshToken, {
        ...cookieOptions,
        maxAge: parseInt(env.REFRESH_TOKEN_AGE),
      });
      res
        .status(httpStatusCode.OK)
        .json({ message: successMessage.SIGNIN_SUCCESS, user: userData.user });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
