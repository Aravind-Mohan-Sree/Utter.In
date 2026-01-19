import { IValidateDataService } from '~service-interfaces/IValidateDataService';
import { BadRequestError } from '~errors/HttpError';

export class FinishRegisterUserDTO {
  email: string;
  knownLanguages: string[];

  constructor(
    data: {
      email: string;
      languages: string[];
    },
    validator: IValidateDataService,
  ) {
    let result = validator.validateEmail(data.email);

    if (!result.success) throw new BadRequestError(result.message);

    result = validator.validateKnownLanguages(data.languages);

    if (!result.success) throw new BadRequestError(result.message);

    this.email = data.email.trim();
    this.knownLanguages = data.languages;
  }
}
