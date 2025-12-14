import { NextFunction, Request, Response } from 'express';
import { RegisterUserDTO } from '~/application/dtos/RegisterUserDTO';
import { SigninUserDTO } from '~/application/dtos/SigninUserDTO';
import { ISendOtpUseCase } from '~application-interfaces/user/IOtpUseCase';
import {
  IRegisterUserUseCase,
  ISigninUserUseCase,
} from '~application-interfaces/user/IUserUseCase';
import { env } from '~config/env';
import { cookieData } from '~constants/cookieData';
import { httpStatusCode } from '~constants/httpStatusCode';
import { successMessage } from '~constants/successMessage';
import { IValidateDataService } from '~domain-services/IValidateDataService';
import { logger } from '~logger/logger';

export class AuthController {
  constructor(
    private registerUser: IRegisterUserUseCase,
    private signinUser: ISigninUserUseCase,
    private validator: IValidateDataService,
    private sendOtp: ISendOtpUseCase,
  ) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = new RegisterUserDTO(req.body, this.validator);

      const email = await this.registerUser.execute(data);

      await this.sendOtp.execute(email);

      res
        .status(httpStatusCode.CREATED)
        .json({ message: successMessage.OTP_SENDED });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  signin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = new SigninUserDTO(req.body, this.validator);
      const userData = await this.signinUser.execute(data);
      const isProduction = env.NODE_ENV === 'production';
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : ('strict' as 'strict' | 'none'),
        maxAge: cookieData.ACCESS_TOKEN_AGE,
        domain: isProduction ? env.COOKIE_DOMAIN : undefined,
        path: '/',
      };

      res.cookie('accessToken', userData.accessToken, cookieOptions);
      res.cookie('refreshToken', userData.refreshToken, cookieOptions);

      res
        .status(httpStatusCode.OK)
        .json({ message: successMessage.SIGNIN_SUCCESS });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
