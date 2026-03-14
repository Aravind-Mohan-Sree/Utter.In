import { NextFunction, Request, Response } from 'express';
import { httpStatusCode } from '~constants/httpStatusCode';
import { successMessage } from '~constants/successMessage';
import { ChangePasswordDTO } from '~dtos/ChangePasswordDTO';
import { TutorProfileUpdateDTO } from '~dtos/TutorProfileUpdateDTO';
import { logger } from '~logger/logger';
import { IValidateDataService } from '~service-interfaces/IValidateDataService';
import {
  IChangePasswordUseCase,
  IUpdateProfileUseCase,
} from '~use-case-interfaces/tutor/ITutorUseCase';

export class ProfileController {
  constructor(
    private _updateProfileUC: IUpdateProfileUseCase,
    private _changePasswordUC: IChangePasswordUseCase,
    private _validator: IValidateDataService,
  ) {}

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.user as { id: string };
      const data = new TutorProfileUpdateDTO(
        (({
          knownLanguages: languages,
          yearsOfExperience: experience,
          ...body
        }) => ({ ...body, languages, experience }))(req.body),
        this._validator,
      );
      const updatedTutor = await this._updateProfileUC.execute(id, data);

      res
        .status(httpStatusCode.OK)
        .json({ message: successMessage.PROFILE_UPDATED, updatedTutor });
    } catch (error) {
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
