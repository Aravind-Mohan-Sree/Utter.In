import { NextFunction, Request, Response } from 'express';
import {
  IGetDataUseCase,
  ITutorGoogleRegisterUseCase,
  ITutorGoogleSigninUseCase,
} from '~use-case-interfaces/tutor/ITutorUseCase';
import { env } from '~config/env';
import { logger } from '~logger/logger';
import { HttpError } from '~errors/HttpError';
import { successMessage } from '~constants/successMessage';
import { IUploadAvatarUseCase } from '~use-case-interfaces/shared/IFileUseCase';
import { filePrefixes } from '~constants/fileConstants';

interface IAuthTutor {
  name: string;
  avatarUrl: string;
  email: string;
  googleId: string;
}

export class TutorGoogleAuthController {
  constructor(
    private _getDataUC: IGetDataUseCase,
    private _googleRegisterUC: ITutorGoogleRegisterUseCase,
    private _googleSigninUC: ITutorGoogleSigninUseCase,
    private _uploadAvatar: IUploadAvatarUseCase,
  ) {}

  handleSuccess = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const { name, email, avatarUrl, googleId } = req.user as unknown as IAuthTutor;
      const tutor = await this._getDataUC.execute(email);

      if (!tutor) {
        const id = await this._googleRegisterUC.execute(name, email, googleId);

        await this._uploadAvatar.execute(
          filePrefixes.TEMP_TUTOR_AVATAR,
          id,
          avatarUrl,
        );

        res.redirect(
          `${env.FRONTEND_URL}/signup?mode=tutor&responseMessage=finishSignup&email=${email}`,
        );
      } else {
        const tutor = await this._googleSigninUC.execute(email, googleId);

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
      }
    } catch (error) {
      logger.error(error);

      if (error instanceof HttpError) {
        res.redirect(
          `${env.FRONTEND_URL}/signin?mode=tutor&responseMessage=${error.message}`,
        );
      } else if (error instanceof Error) {
        res.redirect(
          `${env.FRONTEND_URL}/signin?mode=tutor&responseMessage=${error.message}`,
        );
      }
    }
  };
}
