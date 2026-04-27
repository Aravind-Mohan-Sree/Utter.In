import { NextFunction, Request, Response } from 'express';
import { httpStatusCode } from '~constants/httpStatusCode';
import { successMessage } from '~constants/successMessage';
import { ChangePasswordDTO } from '~dtos/ChangePasswordDTO';
import { UserProfileUpdateDTO } from '~dtos/UserProfileUpdateDTO';
import { logger } from '~logger/logger';
import { IValidateDataService } from '~service-interfaces/IValidateDataService';
import {
  IChangePasswordUseCase,
  IUpdateProfileUseCase,
} from '~use-case-interfaces/user/IUserUseCase';

/**
 * Controller for managing a user's own profile and security settings.
 */
export class ProfileController {
  constructor(
    private _updateProfileUC: IUpdateProfileUseCase,
    private _changePasswordUC: IChangePasswordUseCase,
    private _validator: IValidateDataService,
  ) {}

  /**
   * Updates the authenticated user's profile information.
   */
  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.user as { id: string };
      // Map 'languages' from body to 'knownLanguages' for the DTO
      const data = new UserProfileUpdateDTO(
        (({ knownLanguages: languages, ...body }) => ({ ...body, languages }))(
          req.body,
        ),
        this._validator,
      );
      const updatedUser = await this._updateProfileUC.execute(id, data);

      res
        .status(httpStatusCode.OK)
        .json({ message: successMessage.PROFILE_UPDATED, updatedUser });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  /**
   * Changes the authenticated user's password.
   */
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
