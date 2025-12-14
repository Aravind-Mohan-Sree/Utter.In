import { NextFunction, Request, Response } from 'express';
import { env } from 'process';
import { IGetEntityDataUseCase } from '~application-interfaces/user/IGetEntityDataUseCase';
import { cookieData } from '~constants/cookieData';
import { errorMessage } from '~constants/errorMessage';
import { ITokenService } from '~domain-services/ITokenService';
import { NotFoundError, UnauthorizedError } from '~errors/HttpError';
import { logger } from '~logger/logger';

interface IEntityData {
  id: string;
  isBlocked: boolean;
}

export interface IAuthenticate {
  verify(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export class Authenticate<Entity> implements IAuthenticate {
  constructor(
    private tokenService: ITokenService,
    private getEntity: IGetEntityDataUseCase<Entity>,
  ) {}

  verify = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { accessToken, refreshToken } = req.cookies;
      const isProduction = env.NODE_ENV === 'production';

      if (!accessToken && !refreshToken) {
        throw new UnauthorizedError(errorMessage.SESSION_EXPIRED);
      }

      if (accessToken) {
        const payload = this.tokenService.verifyAuthToken(accessToken);
        const user = (await this.getEntity.getOneById(
          payload.id!,
        )) as IEntityData;

        if (!user || user.isBlocked) {
          const cookieOptions = {
            httpOnly: true,
            sameSite: isProduction ? 'none' : ('strict' as 'none' | 'strict'),
            secure: isProduction,
            domain: isProduction ? env.COOKIE_DOMAIN : undefined,
            path: '/',
          };

          res.clearCookie('accessToken', cookieOptions);
          res.clearCookie('refreshToken', cookieOptions);

          if (!user) {
            throw new NotFoundError(errorMessage.ACCOUNT_NOT_EXISTS);
          } else {
            throw new UnauthorizedError(errorMessage.BLOCKED);
          }
        }

        req.user = {
          id: user.id,
          role: payload.role,
        };

        return next();
      }

      if (refreshToken) {
        const payload = this.tokenService.verifyRefreshToken(refreshToken);
        const cleanPayload = {
          id: payload.id,
          role: payload.role,
        };  
        const newAccessToken =
          this.tokenService.generateAuthToken(cleanPayload);

        res.cookie('accessToken', newAccessToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? 'none' : 'strict',
          maxAge: cookieData.ACCESS_TOKEN_AGE,
          domain: isProduction ? env.COOKIE_DOMAIN : undefined,
          path: '/',
        });

        const user = (await this.getEntity.getOneById(
          payload.id!,
        )) as IEntityData;

        if (user) {
          req.user = {
            id: user.id,
            role: payload.role,
          };

          return next();
        }

        throw new NotFoundError(errorMessage.ACCOUNT_NOT_EXISTS);
      }
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
