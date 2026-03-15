import { Review } from '~entities/Review';

export interface IAddReviewUseCase {
  execute(userId: string, tutorId: string, rating: number, note: string): Promise<Review>;
}

export interface IGetReviewsUseCase {
  execute(
    tutorId: string,
    page: number,
    limit: number,
  ): Promise<{
    reviews: Review[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }>;
}

export interface IUpdateReviewUseCase {
  execute(id: string, userId: string, rating: number, note: string): Promise<Review>;
}

export interface IDeleteReviewUseCase {
  execute(id: string, userId: string): Promise<void>;
}

export interface IGetReviewEligibilityUseCase {
  execute(userId: string, tutorId: string): Promise<{
    canReview: boolean;
    alreadyReviewed: boolean;
  }>;
}
