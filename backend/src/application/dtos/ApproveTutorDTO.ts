import { errorMessage } from '~constants/errorMessage';
import { BadRequestError } from '~errors/HttpError';

export class ApproveTutorDTO {
  id: string;
  certificationType: string;

  constructor(data: { id: string; certificationType: string }) {
    const certificationTypes = [
      'TESOL',
      'CEFR',
      'State Licensed',
      'Goethe',
      'PGCHE',
    ];

    if (!certificationTypes.includes(data.certificationType.trim()))
      throw new BadRequestError(errorMessage.INVALID_DATA);

    this.id = data.id;
    this.certificationType = data.certificationType.trim();
  }
}
