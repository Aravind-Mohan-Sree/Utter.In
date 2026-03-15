import { Review } from '~entities/Review';
import { IReviewRepository } from '~repository-interfaces/IReviewRepository';
import { IUpdateReviewUseCase } from '~use-case-interfaces/user/IReviewUseCase';
import { ForbiddenError, NotFoundError } from '~errors/HttpError';
import { errorMessage } from '~constants/errorMessage';

export class UpdateReviewUseCase implements IUpdateReviewUseCase {
  constructor(private _reviewRepository: IReviewRepository) {}

  async execute(
    id: string,
    userId: string,
    rating: number,
    note: string,
  ): Promise<Review> {
    const existingReview = await this._reviewRepository.findOneById(id);

    if (!existingReview) {
      throw new NotFoundError(errorMessage.REVIEW_NOT_FOUND);
    }

    if (existingReview.userId !== userId) {
      throw new ForbiddenError(errorMessage.REVIEW_NOT_AUTHORIZED);
    }

    const updatedReview = await this._reviewRepository.updateOneById(id, {
      rating,
      note,
    });

    return updatedReview!;
  }
}
