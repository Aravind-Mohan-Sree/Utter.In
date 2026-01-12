import { BadRequestError } from '~errors/HttpError';
import {
  FileInput,
  IValidateDataService,
} from '~service-interfaces/IValidateDataService';

export class AvatarDTO {
  avatar: FileInput;

  constructor(data: { avatar: FileInput }, validator: IValidateDataService) {
    const result = validator.validateAvatar(data.avatar);

    if (!result.success) throw new BadRequestError(result.message);

    this.avatar = data.avatar;
  }
}
