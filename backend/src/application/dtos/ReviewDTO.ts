import { IValidateDataService } from '~service-interfaces/IValidateDataService';
import { BadRequestError } from '~errors/HttpError';
import { errorMessage } from '~constants/errorMessage';

export class AddReviewDTO {
  tutorId: string;
  rating: number;
  note: string;

  constructor(
    data: {
      tutorId: string;
      rating: number;
      note: string;
    },
    validator: IValidateDataService,
  ) {
    if (!data.tutorId) throw new BadRequestError(errorMessage.TUTOR_ID_REQUIRED);

    let result = validator.validateRating(data.rating);
    if (!result.success) throw new BadRequestError(result.message);

    result = validator.validateReviewNote(data.note);
    if (!result.success) throw new BadRequestError(result.message);

    this.tutorId = data.tutorId;
    this.rating = data.rating;
    this.note = data.note.trim();
  }
}

export class UpdateReviewDTO {
  rating: number;
  note: string;

  constructor(
    data: {
      rating: number;
      note: string;
    },
    validator: IValidateDataService,
  ) {
    let result = validator.validateRating(data.rating);
    if (!result.success) throw new BadRequestError(result.message);

    result = validator.validateReviewNote(data.note);
    if (!result.success) throw new BadRequestError(result.message);

    this.rating = data.rating;
    this.note = data.note.trim();
  }
}
