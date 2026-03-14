import { NextFunction, Request, Response } from 'express';
import { unlink } from 'fs/promises';
import { httpStatusCode } from '~constants/httpStatusCode';
import { successMessage } from '~constants/successMessage';
import { AvatarDTO } from '~dtos/AvatarDTO';
import { logger } from '~logger/logger';
import { UploadedFiles } from '~middlewares/multer';
import {
  FileInput,
  IValidateDataService,
} from '~service-interfaces/IValidateDataService';
import {
  IDeleteFileUseCase,
  IUploadFileUseCase,
} from '~use-case-interfaces/shared/IFileUseCase';
import { contentTypes, filePrefixes } from '~constants/fileConstants';

interface User {
  id: string;
  role: 'user' | 'tutor';
}

export class AvatarController {
  constructor(
    private _uploadFile: IUploadFileUseCase,
    private _deleteFile: IDeleteFileUseCase,
    private _validator: IValidateDataService,
  ) {}

  uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as UploadedFiles;
    const avatar = files.avatar ? files.avatar[0] : null;

    try {
      const { id, role } = req.user as User;
      const data = new AvatarDTO(
        { avatar: avatar as FileInput },
        this._validator,
      );
      const prefix =
        role === 'user' ? filePrefixes.USER_AVATAR : filePrefixes.TUTOR_AVATAR;

      await this._uploadFile.execute(
        prefix,
        id,
        data.avatar.path,
        contentTypes.IMAGE_JPEG,
      );

      res
        .status(httpStatusCode.OK)
        .json({ message: successMessage.AVATAR_UPLOADED });
    } catch (error) {
      if (avatar?.path) {
        await unlink(avatar?.path);
      }

      logger.error(error);
      next(error);
    }
  };

  deleteAvatar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, role } = req.user as User;
      const prefix =
        role === 'user' ? filePrefixes.USER_AVATAR : filePrefixes.TUTOR_AVATAR;

      await this._deleteFile.execute(prefix, id, contentTypes.IMAGE_JPEG);

      res
        .status(httpStatusCode.OK)
        .json({ message: successMessage.AVATAR_DELETED });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
