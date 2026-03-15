import { Review } from '~entities/Review';
import { IReviewRepository } from '~repository-interfaces/IReviewRepository';
import { IAddReviewUseCase } from '~use-case-interfaces/user/IReviewUseCase';
import { BadRequestError, ForbiddenError } from '~errors/HttpError';
import { errorMessage } from '~constants/errorMessage';

export class AddReviewUseCase implements IAddReviewUseCase {
  constructor(private _reviewRepository: IReviewRepository) {}

  async execute(
    userId: string,
    tutorId: string,
    rating: number,
    note: string,
  ): Promise<Review> {
    const hasCompletedSession = await this._reviewRepository.checkSessionCompletion(
      userId,
      tutorId,
    );

    if (!hasCompletedSession) {
      throw new ForbiddenError(errorMessage.REVIEW_SESSION_REQUIRED);
    }

    const existingReview = await this._reviewRepository.findOneByField({
      userId,
      tutorId,
    });

    if (existingReview) {
      throw new BadRequestError(errorMessage.REVIEW_ALREADY_EXISTS);
    }

    await this._reviewRepository.create({
      userId,
      tutorId,
      rating,
      note,
    } as Review);

    return (await this._reviewRepository.findOneByField({ userId, tutorId }))!;
  }
}
