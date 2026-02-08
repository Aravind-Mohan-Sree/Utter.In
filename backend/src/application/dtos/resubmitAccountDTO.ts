import {
  FileInput,
  IValidateDataService,
} from '~service-interfaces/IValidateDataService';
import { BadRequestError } from '~errors/HttpError';

export class resubmitAccountDTO {
  email: string;
  introVideo?: FileInput;
  certificate?: FileInput;

  constructor(
    data: {
      email: string;
      introVideo?: FileInput;
      certificate?: FileInput;
    },
    validator: IValidateDataService,
  ) {
    let result = validator.validateEmail(data.email);

    if (!result.success) throw new BadRequestError(result.message);

    if (data.introVideo) {
      result = validator.validateIntroVideo(data.introVideo);

      if (!result.success) throw new BadRequestError(result.message);
    }

    if (data.certificate) {
      result = validator.validateCertificate(data.certificate);

      if (!result.success) throw new BadRequestError(result.message);
    }

    this.email = data.email.trim();
    if (data.introVideo) this.introVideo = data.introVideo;
    if (data.certificate) this.certificate = data.certificate;
  }
}
