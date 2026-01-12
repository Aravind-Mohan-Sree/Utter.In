import { IValidateDataService } from '~service-interfaces/IValidateDataService';
import { BadRequestError } from '~errors/HttpError';

export class ResetPasswordDTO {
  password: string;

  constructor(
    data: {
      password: string;
      confirmPassword: string;
    },
    validator: IValidateDataService,
  ) {
    const result = validator.validatePassword(data.password);

    if (!result.success) throw new BadRequestError(result.message);

    if (data.password.trim() !== data.confirmPassword.trim())
      throw new BadRequestError("Passwords don't match");

    this.password = data.password.trim();
  }
}
