import { NextFunction, Request, Response } from 'express';
import { RegisterTutorDTO } from '~dtos/RegisterTutorDTO';
import { SigninDTO } from '~dtos/SigninDTO';
import { ISendOtpUseCase } from '~use-case-interfaces/shared/IOtpUseCase';
import {
  IFinishRegisterTutorUseCase,
  IRegisterTutorUseCase,
  IResubmitAccountUseCase,
  ISigninTutorUseCase,
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
import { FinishRegisterTutorDTO } from '~dtos/FinishRegisterTutorDTO';
import {
  IUpdateFileUseCase,
  IUploadFileUseCase,
} from '~use-case-interfaces/shared/IFileUseCase';
import { resubmitAccountDTO } from '~dtos/resubmitAccountDTO';
import { contentTypes, filePrefixes } from '~constants/fileConstants';

export class AuthController {
  constructor(
    private _registerTutor: IRegisterTutorUseCase,
    private _finishRegisterTutor: IFinishRegisterTutorUseCase,
    private _resubmitAccountUseCase: IResubmitAccountUseCase,
    private _signinTutor: ISigninTutorUseCase,
    private _validator: IValidateDataService,
    private _sendOtp: ISendOtpUseCase,
    private _videoMetadataService: IVideoMetadataService,
    private _uploadFile: IUploadFileUseCase,
    private _updateFile: IUpdateFileUseCase,
  ) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as UploadedFiles;
    const introVideoFile = files.introVideo ? files.introVideo[0] : null;
    const certificateFile = files.certificate ? files.certificate[0] : null;

    try {
      const { introVideo: _, certificate: __, ...body } = req.body;
      const data = new RegisterTutorDTO(
        { introVideo: introVideoFile, certificate: certificateFile, ...body },
        this._validator,
      );
      const duration = await this._videoMetadataService.getDuration(
        introVideoFile!.path,
      );

      if (duration >= 31) {
        throw new BadRequestError(errorMessage.VIDEO);
      }

      const { id, email } = await this._registerTutor.execute(data);

      await this._uploadFile.execute(
        filePrefixes.TEMP_TUTOR_VIDEO,
        id,
        introVideoFile!.path,
        contentTypes.VIDEO_MP4,
      );
      await this._uploadFile.execute(
        filePrefixes.TEMP_TUTOR_CERTIFICATE,
        id,
        certificateFile!.path,
        contentTypes.APPLICATION_PDF,
      );
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

  finishRegister = async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as UploadedFiles;
    const introVideoFile = files.introVideo ? files.introVideo[0] : null;
    const certificateFile = files.certificate ? files.certificate[0] : null;

    try {
      const { introVideo: _, certificate: __, ...body } = req.body;
      const data = new FinishRegisterTutorDTO(
        { introVideo: introVideoFile, certificate: certificateFile, ...body },
        this._validator,
      );
      const duration = await this._videoMetadataService.getDuration(
        introVideoFile!.path,
      );

      if (duration >= 31) {
        throw new BadRequestError(errorMessage.VIDEO);
      }

      const { oldId, newId } = await this._finishRegisterTutor.execute(data);

      await this._updateFile.execute(
        filePrefixes.TEMP_TUTOR_AVATAR,
        filePrefixes.TUTOR_AVATAR,
        oldId,
        newId,
        contentTypes.IMAGE_JPEG,
      );
      await this._uploadFile.execute(
        filePrefixes.TUTOR_VIDEO,
        newId,
        introVideoFile!.path,
        contentTypes.VIDEO_MP4,
      );
      await this._uploadFile.execute(
        filePrefixes.TUTOR_CERTIFICATE,
        newId,
        certificateFile!.path,
        contentTypes.APPLICATION_PDF,
      );

      res
        .status(httpStatusCode.CREATED)
        .json({ message: successMessage.SIGNUP_SUCCESS });
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

  resubmitAccount = async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as UploadedFiles;
    const introVideoFile = files.introVideo ? files.introVideo[0] : null;
    const certificateFile = files.certificate ? files.certificate[0] : null;

    try {
      const { introVideo: _, certificate: __, ...body } = req.body;
      const data = new resubmitAccountDTO(
        { introVideo: introVideoFile, certificate: certificateFile, ...body },
        this._validator,
      );

      if (introVideoFile) {
        const duration = await this._videoMetadataService.getDuration(
          introVideoFile!.path,
        );

        if (duration >= 31) {
          throw new BadRequestError(errorMessage.VIDEO);
        }
      }

      const { oldId, newId, googleId } =
        await this._resubmitAccountUseCase.execute(data);

      if (googleId) {
        await this._updateFile.execute(
          filePrefixes.TEMP_REJECTED_TUTOR_AVATAR,
          filePrefixes.TUTOR_AVATAR,
          oldId,
          newId,
          contentTypes.IMAGE_JPEG,
        );
      }

      await this._updateFile.execute(
        introVideoFile
          ? filePrefixes.TEMP_REJECTED_TUTOR_CERTIFICATE
          : filePrefixes.TEMP_REJECTED_TUTOR_VIDEO,
        introVideoFile ? filePrefixes.TUTOR_CERTIFICATE : filePrefixes.TUTOR_VIDEO,
        oldId,
        newId,
        introVideoFile ? contentTypes.APPLICATION_PDF : contentTypes.VIDEO_MP4,
      );
      await this._uploadFile.execute(
        introVideoFile ? filePrefixes.TUTOR_VIDEO : filePrefixes.TUTOR_CERTIFICATE,
        oldId,
        introVideoFile ? introVideoFile.path : certificateFile!.path,
        introVideoFile ? contentTypes.VIDEO_MP4 : contentTypes.APPLICATION_PDF,
      );

      res
        .status(httpStatusCode.OK)
        .json({ message: successMessage.ACCOUNT_RESUBMITTED });
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
      const data = new SigninDTO(req.body, this._validator);
      const tutorData = await this._signinTutor.execute(data);
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
