import { ITutor, TutorModel } from '~models/TutorModel';
import { BaseRepository } from './BaseRepository';
import { Tutor } from '~entities/Tutor';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { Document, PipelineStage } from 'mongoose';

export class TutorRepository
  extends BaseRepository<Tutor, ITutor>
  implements ITutorRepository
{
  constructor() {
    super(TutorModel);
  }

  async fetchTutors(
    page: number,
    limit: number,
    query: string,
    filter: string,
  ): Promise<{
    totalTutorsCount: number;
    filteredTutorsCount: number;
    tutors: Tutor[];
  }> {
    const pipeline: PipelineStage[] = [];
    const totalTutorsCount = await this.model.countDocuments({});

    if (filter !== 'All') {
      if (filter === 'Blocked') {
        pipeline.push({ $match: { isBlocked: true } });
      } else if (filter === 'Active') {
        pipeline.push({ $match: { isBlocked: false } });
      } else if (filter === 'Verified') {
        pipeline.push({ $match: { isVerified: true } });
      } else if (filter === 'Pending') {
        pipeline.push({ $match: { isVerified: false, rejectionReason: null } });
      } else if (filter === 'Rejected') {
        pipeline.push({
          $match: {
            rejectionReason: { $ne: null },
          },
        });
      }
    }

    if (query) {
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
            {
              knownLanguages: { $elemMatch: { $regex: query, $options: 'i' } },
            },
          ],
        },
      });
    }

    pipeline.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [
          { $sort: { createdAt: -1, _id: 1 } },
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
      doc.createdAt,
      doc.updatedAt,
    );
  }
}
