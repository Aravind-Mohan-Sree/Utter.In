import { errorMessage } from '~constants/errorMessage';
import { BadRequestError } from '~errors/HttpError';

export class RejectTutorDTO {
  id: string;
  rejectionReason: string;

  constructor(data: { id: string; rejectionReason: string }) {
    const rejectionReasons = [
      'cert/Certification document is blurry or unreadable',
      'cert/Uploaded certificate is expired or invalid',
      'video/Introduction video has poor audio or low lighting',
      'video/Introduction video content is unprofessional or incomplete',
      'cert/Certification does not match the subject expertise claimed',
    ];

    if (!rejectionReasons.includes(data.rejectionReason.trim()))
      throw new BadRequestError(errorMessage.INVALID_DATA);

    this.id = data.id;
    this.rejectionReason = data.rejectionReason.trim();
  }
}
