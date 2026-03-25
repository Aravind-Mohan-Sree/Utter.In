import { IValidateDataService } from '~service-interfaces/IValidateDataService';
import { BadRequestError } from '~errors/HttpError';
import { errorMessage } from '~constants/errorMessage';

export class SendMessageDTO {
  public receiverId: string;
  public text?: string;
  public fileUrl?: string;
  public fileType?: string;
  public fileName?: string;

  constructor(
    data: {
      receiverId: string;
      text?: string;
      fileUrl?: string;
      fileType?: string;
      fileName?: string;
    },
    validator: IValidateDataService,
  ) {
    if (!data.receiverId) {
      throw new BadRequestError(errorMessage.RECEIVER_ID_REQUIRED);
    }

    if (!data.text?.trim() && !data.fileUrl) {
      throw new BadRequestError(errorMessage.MESSAGE_TEXT_REQUIRED);
    }

    if (data.text) {
      const result = validator.validateMessageText(data.text);
      if (!result.success) {
        throw new BadRequestError(result.message);
      }
    }

    this.receiverId = data.receiverId;
    this.text = data.text;
    this.fileUrl = data.fileUrl;
    this.fileType = data.fileType;
    this.fileName = data.fileName;
  }
}
