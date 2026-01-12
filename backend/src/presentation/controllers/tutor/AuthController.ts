import { NextFunction, Request, Response } from 'express';
import { RegisterTutorDTO } from '~dtos/RegisterTutorDTO';
import { SigninDTO } from '~dtos/SigninDTO';
import { ISendOtpUseCase } from '~use-case-interfaces/shared/IOtpUseCase';
import {
  IRegisterTutorUseCase,
  ISigninTutorUseCase,
  IUploadTutorFilesUseCase,
} from '~use-case-interfaces/tutor/ITutorUseCase';
import { env } from '~config/env';
import { httpStatusCode } from '~constants/httpStatusCode';
import { successMessage } from '~constants/successMessage';
import { IValidateDataService } from '~service-interfaces/IValidateDataService';
import { logger } from '~logger/logger';
import { UploadedFiles } from '~middlewares/multer';
import { IVideoMetadataService } from '~service-interfaces/IVideoMetadataService';
import { errorMessage } from '~constants/errorMessage';
import { BadRequestError } from '~errors/HttpError';
import { unlink } from 'fs/promises';

export class AuthController {
  constructor(
    private registerTutor: IRegisterTutorUseCase,
    private signinTutor: ISigninTutorUseCase,
    private validator: IValidateDataService,
    private sendOtp: ISendOtpUseCase,
    private videoMetadataService: IVideoMetadataService,
    private uploadTutorFiles: IUploadTutorFilesUseCase,
  ) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as UploadedFiles;
    const introVideoFile = files.introVideo ? files.introVideo[0] : null;
    const certificateFile = files.certificate ? files.certificate[0] : null;

    try {
      const { introVideo: _, certificate: __, ...body } = req.body;
      const data = new RegisterTutorDTO(
        { introVideo: introVideoFile, certificate: certificateFile, ...body },
        this.validator,
      );
      const duration = await this.videoMetadataService.getDuration(
        introVideoFile!.path,
      );

      if (duration >= 31) {
        throw new BadRequestError(errorMessage.VIDEO);
      }

      const email = await this.registerTutor.execute(data);

      await this.uploadTutorFiles.execute(
        email,
        introVideoFile!.path,
        certificateFile!.path,
      );
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
      if (introVideoFile?.path) {
        await unlink(introVideoFile.path);
      }

      if (certificateFile?.path) {
        await unlink(certificateFile.path);
      }

      logger.error(error);
      next(error);
    }
  };

  signin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = new SigninDTO(req.body, this.validator);
      const tutorData = await this.signinTutor.execute(data);
      const isProduction = env.NODE_ENV === 'production';
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : ('strict' as 'strict' | 'none'),
        domain: isProduction ? env.COOKIE_DOMAIN : undefined,
        path: '/',
      };

      res.cookie('accessToken', tutorData.accessToken, {
        ...cookieOptions,
        maxAge: parseInt(env.ACCESS_TOKEN_AGE),
      });
      res.cookie('refreshToken', tutorData.refreshToken, {
        ...cookieOptions,
        maxAge: parseInt(env.REFRESH_TOKEN_AGE),
      });
      res.status(httpStatusCode.OK).json({
        message: successMessage.SIGNIN_SUCCESS,
        tutor: tutorData.tutor,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
