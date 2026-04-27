import { BadRequestError } from '~errors/HttpError';
import {
  FileInput,
  IValidateDataService,
} from '~service-interfaces/IValidateDataService';

export class TutorProfileUpdateDTO {
  name: string;
  bio: string;
  knownLanguages: string[];
  yearsOfExperience: string;
  certificate: FileInput | null;

  constructor(
    data: {
      name: string;
      bio: string;
      languages: string[];
      experience: string;
      certificate?: FileInput | null;
    },
    validator: IValidateDataService,
  ) {
    let result = validator.validateName(data.name);

    if (!result.success) throw new BadRequestError(result.message);

    result = validator.validateBio(data.bio);

    if (!result.success) throw new BadRequestError(result.message);

    result = validator.validateKnownLanguages(data.languages);

    if (!result.success) throw new BadRequestError(result.message);

    result = validator.validateExperience(data.experience);

    if (!result.success) throw new BadRequestError(result.message);

    if (data.certificate) {
      result = validator.validateCertificate(data.certificate);
      if (!result.success) throw new BadRequestError(result.message);
    }

    this.name = data.name.trim();
    this.bio = data.bio.trim();
    this.knownLanguages = data.languages;
    this.yearsOfExperience = data.experience.trim();
    this.certificate = data.certificate || null;
  }
}
