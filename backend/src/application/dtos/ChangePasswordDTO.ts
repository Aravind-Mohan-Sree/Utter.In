import { IValidateDataService } from '~service-interfaces/IValidateDataService';
import { BadRequestError } from '~errors/HttpError';

export class ChangePasswordDTO {
  currentPassword: string;
  password: string;

  constructor(
    data: {
      currentPassword: string;
      password: string;
      confirmPassword: string;
    },
    validator: IValidateDataService,
  ) {
    let result = validator.validatePassword(data.currentPassword);

    if (!result.success) throw new BadRequestError(result.message);

    result = validator.validatePassword(data.password);

    if (!result.success) throw new BadRequestError(result.message);

    if (data.password.trim() !== data.confirmPassword.trim())
      throw new BadRequestError("Passwords don't match");

    this.currentPassword = data.currentPassword.trim();
    this.password = data.password.trim();
  }
}
