import { Review } from '~entities/Review';
import { IReviewRepository } from '~repository-interfaces/IReviewRepository';
import ReviewModel, { IReview } from '~models/ReviewModel';
import { BaseRepository } from './BaseRepository';
import { BookingModel } from '~models/BookingModel';
import mongoose from 'mongoose';
import { FilterQuery } from '~repository-interfaces/IBaseRepository';

export class ReviewRepository
  extends BaseRepository<Review, IReview>
  implements IReviewRepository
{
  constructor() {
    super(ReviewModel);
  }

  protected toSchema(
    entity: Review | Partial<Review>,
  ): IReview | Partial<IReview> {
    return {
      userId: entity.userId ? new mongoose.Types.ObjectId(entity.userId) : undefined,
      tutorId: entity.tutorId ? new mongoose.Types.ObjectId(entity.tutorId) : undefined,
      rating: entity.rating,
      note: entity.note,
    } as Partial<IReview>;
  }

  protected toEntity(doc: IReview | null): Review | null {
    if (!doc) return null;

    const userId = (doc.userId as any)?._id || doc.userId;
    const tutorId = (doc.tutorId as any)?._id || doc.tutorId;

    return new Review(
      String(doc._id),
      String(userId),
      String(tutorId),
      doc.rating,
      doc.note,
      doc.createdAt,
      doc.updatedAt,
      (doc as any).userId?.name,
      (doc as any).userId?.avatarUrl,
    );
  }

  async findOneById(id: string): Promise<Review | null> {
    const doc = await ReviewModel.findById(id).populate(
      'userId',
      'name avatarUrl',
    );
    return this.toEntity(doc);
  }

  async findOneByField(filter: FilterQuery<IReview>): Promise<Review | null> {
    const doc = await ReviewModel.findOne(filter).populate(
      'userId',
      'name avatarUrl',
    );
    return this.toEntity(doc);
  }

  async findAllByField(
    filter: FilterQuery<IReview>,
    options?: { skip?: number; limit?: number },
  ): Promise<Review[]> {
    let query = ReviewModel.find(filter)
      .populate('userId', 'name avatarUrl')
      .sort({ createdAt: -1 });

    if (options?.skip !== undefined) query = query.skip(options.skip);
    if (options?.limit !== undefined) query = query.limit(options.limit);

    const docs = await query;
    return docs.map((doc) => this.toEntity(doc)!);
  }

  async countDocuments(filter: FilterQuery<IReview>): Promise<number> {
    return ReviewModel.countDocuments(filter);
  }

  async checkSessionCompletion(
    userId: string,
    tutorId: string,
  ): Promise<boolean> {
    const count = await BookingModel.countDocuments({
      userId,
      tutorId,
      status: 'Completed',
    });
    return count > 0;
  }
}
