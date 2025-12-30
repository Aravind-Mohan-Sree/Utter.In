import {
  FileInput,
  IValidateDataService,
} from '~service-interfaces/IValidateDataService';
import { BadRequestError } from '~errors/HttpError';

export class RegisterTutorDTO {
  name: string;
  email: string;
  knownLanguages: string[];
  yearsOfExperience: string;
  introVideo: FileInput;
  certificate: FileInput;
  password: string;

  constructor(
    data: {
      name: string;
      email: string;
      languages: string[];
      experience: string;
      introVideo: FileInput;
      certificate: FileInput;
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

    result = validator.validateExperience(data.experience);

    if (!result.success) throw new BadRequestError(result.message);

    result = validator.validateIntroVideo(data.introVideo);

    if (!result.success) throw new BadRequestError(result.message);

    result = validator.validateCertificate(data.certificate);

    if (!result.success) throw new BadRequestError(result.message);

    result = validator.validatePassword(data.password);

    if (!result.success) throw new BadRequestError(result.message);

    if (data.password !== data.confirmPassword)
      throw new BadRequestError("Passwords don't match");

    this.name = data.name;
    this.email = data.email;
    this.knownLanguages = data.languages;
    this.yearsOfExperience = data.experience;
    this.introVideo = data.introVideo;
    this.certificate = data.certificate;
    this.password = data.password;
  }
}
