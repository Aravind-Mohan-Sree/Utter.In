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
  IDeleteAvatarUseCase,
  IUploadAvatarUseCase,
} from '~use-case-interfaces/shared/IAvatarUseCase';

export class AvatarController {
  constructor(
    private uploadAvatarUC: IUploadAvatarUseCase,
    private deleteAvatarUC: IDeleteAvatarUseCase,
    private validator: IValidateDataService,
  ) {}

  uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as UploadedFiles;
    const avatar = files.avatar ? files.avatar[0] : null;

    try {
      const { id } = req.user as { id: string };
      const data = new AvatarDTO(
        { avatar: avatar as FileInput },
        this.validator,
      );

      await this.uploadAvatarUC.execute(id, data.avatar.path);

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
      const { id } = req.user as { id: string };

      await this.deleteAvatarUC.execute(id);

      res
        .status(httpStatusCode.OK)
        .json({ message: successMessage.AVATAR_DELETED });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
