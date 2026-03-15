import { Review } from '~entities/Review';

export class ReviewMapper {
  static toResponse(review: Review) {
    return {
      id: review.id,
      userId: review.userId,
      tutorId: review.tutorId,
      rating: review.rating,
      note: review.note,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      userName: review.userName,
      userAvatar: review.userAvatar,
    };
  }

  static toResponseList(reviews: Review[]) {
    return reviews.map((review) => this.toResponse(review));
  }
}
