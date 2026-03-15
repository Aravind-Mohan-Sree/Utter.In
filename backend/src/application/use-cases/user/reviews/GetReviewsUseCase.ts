import { Review } from '~entities/Review';
import { IReviewRepository } from '~repository-interfaces/IReviewRepository';
import { IGetReviewsUseCase } from '~use-case-interfaces/user/IReviewUseCase';

export class GetReviewsUseCase implements IGetReviewsUseCase {
  constructor(private _reviewRepository: IReviewRepository) {}

  async execute(
    tutorId: string,
    page: number,
    limit: number,
  ): Promise<{
    reviews: Review[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }> {
    const skip = (page - 1) * limit;
    const [reviews, totalCount] = await Promise.all([
      this._reviewRepository.findAllByField({ tutorId }, { skip, limit }),
      this._reviewRepository.countDocuments({ tutorId }),
    ]);

    return {
      reviews: reviews || [],
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  }
}
