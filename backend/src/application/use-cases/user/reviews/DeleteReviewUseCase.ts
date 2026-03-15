import { IReviewRepository } from '~repository-interfaces/IReviewRepository';
import { IDeleteReviewUseCase } from '~use-case-interfaces/user/IReviewUseCase';
import { ForbiddenError, NotFoundError } from '~errors/HttpError';
import { errorMessage } from '~constants/errorMessage';

export class DeleteReviewUseCase implements IDeleteReviewUseCase {
  constructor(private _reviewRepository: IReviewRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const existingReview = await this._reviewRepository.findOneById(id);

    if (!existingReview) {
      throw new NotFoundError(errorMessage.REVIEW_NOT_FOUND);
    }

    if (existingReview.userId !== userId) {
      throw new ForbiddenError(errorMessage.REVIEW_NOT_AUTHORIZED);
    }

    await this._reviewRepository.deleteOneById(id);
  }
}
