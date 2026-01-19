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

interface User {
  id: string;
  role: 'user' | 'tutor';
}

export class AvatarController {
  constructor(
    private uploadFile: IUploadFileUseCase,
    private deleteFile: IDeleteFileUseCase,
    private validator: IValidateDataService,
  ) {}

  uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as UploadedFiles;
    const avatar = files.avatar ? files.avatar[0] : null;

    try {
      const { id, role } = req.user as User;
      const data = new AvatarDTO(
        { avatar: avatar as FileInput },
        this.validator,
      );
      const prefix = role === 'user' ? 'users/avatars/' : 'tutors/avatars/';

      await this.uploadFile.execute(prefix, id, data.avatar.path, 'image/jpeg');

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
      const prefix = role === 'user' ? 'users/avatars/' : 'tutors/avatars/';

      await this.deleteFile.execute(prefix, id, 'image/jpeg');

      res
        .status(httpStatusCode.OK)
        .json({ message: successMessage.AVATAR_DELETED });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
