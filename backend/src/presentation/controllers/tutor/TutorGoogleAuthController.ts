import { NextFunction, Request, Response } from 'express';
import { ITutorGoogleAuthUseCase } from '~use-case-interfaces/tutor/ITutorUseCase';
import { env } from '~config/env';
import { logger } from '~logger/logger';
import { HttpError } from '~errors/HttpError';
import { successMessage } from '~constants/successMessage';

interface IAuthTutor {
  email: string;
  googleId: string;
}

export class TutorGoogleAuthController {
  constructor(private googleAuth: ITutorGoogleAuthUseCase) {}

  handleSuccess = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const { email, googleId } = req.user as IAuthTutor;

      const tutor = await this.googleAuth.execute(email, googleId);

      const isProduction = env.NODE_ENV === 'production';
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : ('strict' as 'strict' | 'none'),
        domain: isProduction ? env.COOKIE_DOMAIN : undefined,
        path: '/',
      };

      res.cookie('accessToken', tutor.accessToken, {
        ...cookieOptions,
        maxAge: parseInt(env.ACCESS_TOKEN_AGE),
      });
      res.cookie('refreshToken', tutor.refreshToken, {
        ...cookieOptions,
        maxAge: parseInt(env.REFRESH_TOKEN_AGE),
      });
      res.redirect(
        `${env.FRONTEND_URL}/google?id=${encodeURIComponent(tutor.tutor.id!)}&name=${encodeURIComponent(tutor.tutor.name!)}&email=${encodeURIComponent(tutor.tutor.email!)}&role=${encodeURIComponent(tutor.tutor.role!)}&responseMessage=${successMessage.SIGNIN_SUCCESS}`,
      );
    } catch (error: unknown) {
      const { email } = req.user as IAuthTutor;

      logger.error(error);

      if (error instanceof HttpError) {
        res.redirect(
          `${env.FRONTEND_URL}/signin?mode=tutor&responseMessage=${error.message}&email=${email}`,
        );
      } else if (error instanceof Error) {
        res.redirect(
          `${env.FRONTEND_URL}/signin?mode=tutor&responseMessage=${error.message}&email=${email}`,
        );
      }
    }
  };
}
