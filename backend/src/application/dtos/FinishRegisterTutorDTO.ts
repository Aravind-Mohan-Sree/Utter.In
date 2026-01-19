import {
  FileInput,
  IValidateDataService,
} from '~service-interfaces/IValidateDataService';
import { BadRequestError } from '~errors/HttpError';

export class FinishRegisterTutorDTO {
  email: string;
  knownLanguages: string[];
  yearsOfExperience: string;
  introVideo: FileInput;
  certificate: FileInput;

  constructor(
    data: {
      email: string;
      languages: string[];
      experience: string;
      introVideo: FileInput;
      certificate: FileInput;
    },
    validator: IValidateDataService,
  ) {
    let result = validator.validateEmail(data.email);

    if (!result.success) throw new BadRequestError(result.message);

    result = validator.validateKnownLanguages(data.languages);

    if (!result.success) throw new BadRequestError(result.message);

    result = validator.validateExperience(data.experience);

    if (!result.success) throw new BadRequestError(result.message);

    result = validator.validateIntroVideo(data.introVideo);

    if (!result.success) throw new BadRequestError(result.message);

    result = validator.validateCertificate(data.certificate);

    if (!result.success) throw new BadRequestError(result.message);

    this.email = data.email.trim();
    this.knownLanguages = data.languages;
    this.yearsOfExperience = data.experience.trim();
    this.introVideo = data.introVideo;
    this.certificate = data.certificate;
  }
}
