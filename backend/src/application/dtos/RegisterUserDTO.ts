import { IValidateDataService } from '~domain-services/IValidateDataService';
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
      knownLanguages: string[];
      password: string;
    },
    validator: IValidateDataService,
  ) {
    let result = validator.validateName(data.name);

    if (!result.success) throw new BadRequestError(result.message);

    result = validator.validateEmail(data.email);

    if (!result.success) throw new BadRequestError(result.message);

    result = validator.validateKnownLanguages(data.knownLanguages);

    if (!result.success) throw new BadRequestError(result.message);

    result = validator.validatePassword(data.password);

    if (!result.success) throw new BadRequestError(result.message);

    this.name = data.name;
    this.email = data.email;
    this.knownLanguages = data.knownLanguages;
    this.password = data.password;
  }
}
