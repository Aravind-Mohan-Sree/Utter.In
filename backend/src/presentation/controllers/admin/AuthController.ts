import { NextFunction, Request, Response } from 'express';
import { env } from '~config/env';
import { httpStatusCode } from '~constants/httpStatusCode';
import { successMessage } from '~constants/successMessage';
import { SigninDTO } from '~dtos/SigninDTO';
import { logger } from '~logger/logger';
import { IValidateDataService } from '~service-interfaces/IValidateDataService';
import { ISigninUseCase } from '~use-case-interfaces/admin/IAdminUseCase';

export class AuthController {
  constructor(
    private signinUC: ISigninUseCase,
    private validator: IValidateDataService,
  ) {}

  signin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = new SigninDTO(req.body, this.validator);
      const adminData = await this.signinUC.execute(data);
      const isProduction = env.NODE_ENV === 'production';
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : ('strict' as 'strict' | 'none'),
        domain: isProduction ? env.COOKIE_DOMAIN : undefined,
        path: '/',
      };

      res.cookie('accessToken', adminData.accessToken, {
        ...cookieOptions,
        maxAge: parseInt(env.ACCESS_TOKEN_AGE),
      });
      res.cookie('refreshToken', adminData.refreshToken, {
        ...cookieOptions,
        maxAge: parseInt(env.REFRESH_TOKEN_AGE),
      });

      res.status(httpStatusCode.OK).json({
        message: successMessage.SIGNIN_SUCCESS,
        admin: adminData.admin,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
