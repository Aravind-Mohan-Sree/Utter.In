import { IValidateDataService } from '~service-interfaces/IValidateDataService';
import { BadRequestError } from '~errors/HttpError';
import { errorMessage } from '~constants/errorMessage';

export class SendMessageDTO {
  public receiverId: string;
  public text: string;

  constructor(
    data: {
      receiverId: string;
      text: string;
    },
    validator: IValidateDataService,
  ) {
    if (!data.receiverId) {
      throw new BadRequestError(errorMessage.RECEIVER_ID_REQUIRED);
    }

    const result = validator.validateMessageText(data.text);
    if (!result.success) {
      throw new BadRequestError(result.message);
    }

    this.receiverId = data.receiverId;
    this.text = data.text;
  }
}
