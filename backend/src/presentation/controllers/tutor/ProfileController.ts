import { NextFunction, Request, Response } from 'express';
import { httpStatusCode } from '~constants/httpStatusCode';
import { successMessage } from '~constants/successMessage';
import { ChangePasswordDTO } from '~dtos/ChangePasswordDTO';
import { TutorProfileUpdateDTO } from '~dtos/TutorProfileUpdateDTO';
import { UploadedFiles } from '~middlewares/multer';
import { unlink } from 'fs/promises';
import { IValidateDataService } from '~service-interfaces/IValidateDataService';
import {
  IChangePasswordUseCase,
  IUpdateProfileUseCase,
} from '~use-case-interfaces/tutor/ITutorUseCase';
import { logger } from '~logger/logger';

export class ProfileController {
  constructor(
    private _updateProfileUC: IUpdateProfileUseCase,
    private _changePasswordUC: IChangePasswordUseCase,
    private _validator: IValidateDataService,
  ) {}

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as UploadedFiles;
    const certificateFile = files?.certificate ? files.certificate[0] : null;

    try {
      const { id } = req.user as { id: string };
      
      const languages = req.body.languages || req.body.knownLanguages || req.body['knownLanguages[]'];
      const experience = req.body.experience || req.body.yearsOfExperience;

      const data = new TutorProfileUpdateDTO(
        {
          ...req.body,
          languages: Array.isArray(languages) ? languages : languages ? [languages] : [],
          experience: experience || '',
          certificate: certificateFile,
        },
        this._validator,
      );
      const updatedTutor = await this._updateProfileUC.execute(id, data);

      res
        .status(httpStatusCode.OK)
        .json({ message: successMessage.PROFILE_UPDATED, updatedTutor });
    } catch (error) {
      if (certificateFile?.path) {
        await unlink(certificateFile.path);
      }
      logger.error(error);
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.user as { id: string };
      const data = new ChangePasswordDTO(req.body, this._validator);

      await this._changePasswordUC.execute(id, data);

      res
        .status(httpStatusCode.OK)
        .json({ message: successMessage.PASSWORD_UPDATED });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
