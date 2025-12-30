import { ITutor, TutorModel } from '~models/TutorModel';
import { BaseRepository } from './BaseRepository';
import { Tutor } from '~entities/Tutor';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { Document } from 'mongoose';

export class TutorRepository
  extends BaseRepository<Tutor, ITutor>
  implements ITutorRepository
{
  constructor() {
    super(TutorModel);
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
      doc.rejectionReason,
      String(doc._id),
      doc.createdAt,
      doc.updatedAt,
    );
  }
}
