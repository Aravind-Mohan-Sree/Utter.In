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

export class ProfileController {
  constructor(
    private updateProfileUC: IUpdateProfileUseCase,
    private changePasswordUC: IChangePasswordUseCase,
    private validator: IValidateDataService,
  ) {}

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.user as { id: string };
      const data = new UserProfileUpdateDTO(
        (({ knownLanguages: languages, ...body }) => ({ ...body, languages }))(
          req.body,
        ),
        this.validator,
      );
      const updatedUser = await this.updateProfileUC.execute(id, data);

      res
        .status(httpStatusCode.OK)
        .json({ message: successMessage.PROFILE_UPDATED, updatedUser });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.user as { id: string };
      const data = new ChangePasswordDTO(req.body, this.validator);

      await this.changePasswordUC.execute(id, data);

      res
        .status(httpStatusCode.OK)
        .json({ message: successMessage.PASSWORD_UPDATED });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
