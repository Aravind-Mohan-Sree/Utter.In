import { IValidateDataService } from '~service-interfaces/IValidateDataService';
import { BadRequestError } from '~errors/HttpError';

export class RegisterUserDTO {
  name: string;
  email: string;
  knownLanguages: string[];
  password: string;

  constructor(
    data: {
      name: string;
      email: string;
      languages: string[];
      password: string;
      confirmPassword: string;
    },
    validator: IValidateDataService,
  ) {
    let result = validator.validateName(data.name);

    if (!result.success) throw new BadRequestError(result.message);

    result = validator.validateEmail(data.email);

    if (!result.success) throw new BadRequestError(result.message);

    result = validator.validateKnownLanguages(data.languages);

    if (!result.success) throw new BadRequestError(result.message);

    result = validator.validatePassword(data.password);

    if (!result.success) throw new BadRequestError(result.message);

    if (data.password.trim() !== data.confirmPassword.trim())
      throw new BadRequestError("Passwords don't match");

    this.name = data.name.trim();
    this.email = data.email.trim();
    this.knownLanguages = data.languages;
    this.password = data.password.trim();
  }
}
