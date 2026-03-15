import { IReviewRepository } from '~repository-interfaces/IReviewRepository';
import { IGetReviewEligibilityUseCase } from '~use-case-interfaces/user/IReviewUseCase';

export class GetReviewEligibilityUseCase implements IGetReviewEligibilityUseCase {
  constructor(private _reviewRepository: IReviewRepository) {}

  async execute(userId: string, tutorId: string): Promise<{
    canReview: boolean;
    alreadyReviewed: boolean;
  }> {
    const hasCompletedSession = await this._reviewRepository.checkSessionCompletion(
      userId,
      tutorId,
    );
    const existingReview = await this._reviewRepository.findOneByField({
      userId,
      tutorId,
    });

    return {
      canReview: hasCompletedSession,
      alreadyReviewed: !!existingReview,
    };
  }
}
