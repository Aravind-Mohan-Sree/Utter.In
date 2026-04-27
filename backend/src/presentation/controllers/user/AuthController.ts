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
import { contentTypes, filePrefixes } from '~constants/fileConstants';

/**
 * Controller for user authentication and registration flows.
 * Handles initial registration, finalization after OTP, and sign-in.
 */
export class AuthController {
  constructor(
    private _registerUser: IRegisterUserUseCase,
    private _finishRegisterUser: IFinishRegisterUserUseCase,
    private _signinUser: ISigninUserUseCase,
    private _validator: IValidateDataService,
    private _sendOtp: ISendOtpUseCase,
    private _updateFile: IUpdateFileUseCase,
  ) {}

  /**
   * Initiates user registration and sends OTP to the user's email.
   */
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = new RegisterUserDTO(req.body, this._validator);
      const email = await this._registerUser.execute(data);

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
        .status(httpStatusCode.CREATED)
        .json({ message: successMessage.OTP_SENDED });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  /**
   * Finalizes user registration after OTP verification.
   * Promotes the pending user to a permanent account and sets session cookies.
   */
  finishRegister = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = new FinishRegisterUserDTO({ ...req.body }, this._validator);
      const isProduction = env.NODE_ENV === 'production';
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : ('strict' as 'strict' | 'none'),
        domain: isProduction ? env.COOKIE_DOMAIN : undefined,
        path: '/',
      };

      const userData = await this._finishRegisterUser.execute(data);

      // Transition the temporary avatar to the permanent path
      await this._updateFile.execute(
        filePrefixes.TEMP_USER_AVATAR,
        filePrefixes.USER_AVATAR,
        userData.oldId,
        userData.user.id!,
        contentTypes.IMAGE_JPEG,
      );

      // Set auth cookies
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

  /**
   * Standard user sign-in.
   * Validates credentials and sets JWT cookies.
   */
  signin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = new SigninDTO(req.body, this._validator);
      const userData = await this._signinUser.execute(data);
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
