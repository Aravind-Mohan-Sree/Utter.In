import { IValidateDataService } from '~service-interfaces/IValidateDataService';
import { BadRequestError } from '~errors/HttpError';

export class CreateAbuseReportDTO {
  public reportedId: string;
  public type: string;
  public description: string;
  public messages: {
    senderId: string;
    text?: string;
    timestamp: Date;
    fileUrl?: string;
    fileType?: string;
    fileName?: string;
  }[];
  public channel: 'chat' | 'video';

  constructor(data: any, validator: IValidateDataService) {
    if (!data.reportedId) {
      throw new BadRequestError('Reported user ID is required');
    }
    if (!data.type) {
      throw new BadRequestError('Abuse type is required');
    }
    if (!data.description || data.description.trim().length < 10) {
      throw new BadRequestError('Description is required and must be at least 10 characters long');
    }
    if (!data.channel) {
      throw new BadRequestError('Channel is required');
    }

    this.reportedId = data.reportedId;
    this.type = data.type;
    this.description = data.description;
    this.messages = data.messages || [];
    this.channel = data.channel;
  }
}
