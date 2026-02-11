import { ITutor, TutorModel } from '~models/TutorModel';
import { BaseRepository } from './BaseRepository';
import { Tutor } from '~entities/Tutor';
import { Document, PipelineStage, mongo } from 'mongoose';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';

export class TutorRepository
  extends BaseRepository<Tutor, ITutor>
  implements ITutorRepository {
  constructor() {
    super(TutorModel);
  }

  async fetchTutors(
    page: number,
    limit: number,
    query: string,
    filter: string,
    sort = 'newest',
    language = 'All',
    isAdmin = false,
  ): Promise<{
    totalTutorsCount: number;
    filteredTutorsCount: number;
    tutors: Tutor[];
  }> {
    const pipeline: PipelineStage[] = [];
    const totalTutorsCount = await this.model.countDocuments({});
    const matchStage: mongo.Filter<ITutor> = {};

    if (isAdmin) {
      if (filter !== 'All') {
        if (filter === 'Blocked') matchStage.isBlocked = true;
        else if (filter === 'Active') matchStage.isBlocked = false;
        else if (filter === 'Approved') {
          matchStage.isVerified = true;
        } else if (filter === 'Pending') {
          matchStage.isVerified = false;
          matchStage.rejectionReason = null;
        } else if (filter === 'Rejected') {
          matchStage.rejectionReason = { $ne: null };
        }
      }
    } else {
      matchStage.isVerified = true;
      matchStage.isBlocked = false;
    }

    if (language && language !== 'All') {
      matchStage.knownLanguages = { $in: [language] };
    }

    if (query) {
      const searchConditions: mongo.Filter<ITutor>[] = [
        { name: { $regex: query, $options: 'i' } },
        { knownLanguages: { $elemMatch: { $regex: query, $options: 'i' } } },
      ];

      if (isAdmin) {
        searchConditions.push({ email: { $regex: query, $options: 'i' } });
      }

      matchStage.$or = searchConditions;
    }

    pipeline.push({ $match: matchStage as Record<string, unknown> });

    let sortStage: Record<string, 1 | -1> = { createdAt: -1, _id: 1 };

    if (sort === 'oldest') sortStage = { createdAt: 1, _id: 1 };
    else if (sort === 'a-z') sortStage = { name: 1, _id: 1 };
    else if (sort === 'z-a') sortStage = { name: -1, _id: 1 };

    pipeline.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [
          { $sort: sortStage },
          { $skip: (page - 1) * limit },
          { $limit: limit },
        ],
      },
    });

    const result = await this.model.aggregate(pipeline);
    const tutors = result[0].data || [];
    const filteredTutorsCount = result[0].metadata[0]?.total || 0;

    return {
      totalTutorsCount,
      filteredTutorsCount,
      tutors: tutors.map(this.toEntity),
    };
  }

  protected toSchema(entity: Tutor | Partial<Tutor>): ITutor | Partial<ITutor> {
    return {
      name: entity.name,
      email: entity.email,
      knownLanguages: entity.knownLanguages,
      yearsOfExperience: entity.yearsOfExperience,
      bio: entity.bio,
      password: entity.password,
      role: entity.role,
      isBlocked: entity.isBlocked,
      isVerified: entity.isVerified,
      certificationType: entity.certificationType,
      rejectionReason: entity.rejectionReason,
      googleId: entity.googleId!,
      expiresAt: entity.expiresAt || undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  protected toEntity(doc: (ITutor & Document<unknown>) | null): Tutor | null {
    if (!doc) return null;

    return new Tutor(
      doc.name,
      doc.email,
      doc.knownLanguages,
      doc.yearsOfExperience,
      doc.bio,
      doc.password,
      doc.googleId,
      doc.role,
      doc.isBlocked,
      doc.isVerified,
      doc.certificationType,
      doc.rejectionReason,
      String(doc._id),
      doc.expiresAt,
      doc.createdAt,
      doc.updatedAt,
    );
  }
}
