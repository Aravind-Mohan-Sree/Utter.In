import { IValidateDataService } from '~domain-services/IValidateDataService';
import { BadRequestError } from '~errors/HttpError';

export class SigninUserDTO {
  email: string;
  password: string;

  constructor(
    data: {
      email: string;
      password: string;
    },
    validator: IValidateDataService,
  ) {
    let result = validator.validateEmail(data.email);

    if (!result.success) throw new BadRequestError(result.message);

    result = validator.validatePassword(data.password);

    if (!result.success) throw new BadRequestError(result.message);

    this.email = data.email;
    this.password = data.password;
  }
}
