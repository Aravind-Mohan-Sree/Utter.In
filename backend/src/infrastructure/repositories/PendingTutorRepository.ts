import { PendingTutor } from '~entities/PendingTutor';
import { BaseRepository } from './BaseRepository';
import { IPendingTutor, PendingTutorModel } from '~models/PendingTutorModel';
import { IPendingTutorRepository } from '~repository-interfaces/IPendingTutorRepository';
import { Document } from 'mongoose';

/**
 * Concrete repository for PendingTutor entities using Mongoose.
 * Temporary storage for tutor registration data during OTP verification.
 */
export class PendingTutorRepository
  extends BaseRepository<PendingTutor, IPendingTutor>
  implements IPendingTutorRepository {
  constructor() {
    super(PendingTutorModel);
  }

  /**
   * Internal mapper to convert domain entity to Mongoose schema object.
   */
  protected toSchema(
    entity: PendingTutor | Partial<PendingTutor>,
  ): IPendingTutor | Partial<IPendingTutor> {
    return {
      name: entity.name!,
      email: entity.email,
      knownLanguages: entity.knownLanguages!,
      yearsOfExperience: entity.yearsOfExperience!,
      password: entity.password!,
      googleId: entity.googleId,
      createdAt: entity.createdAt!,
      updatedAt: entity.updatedAt!,
    };
  }

  /**
   * Internal mapper to convert Mongoose document to domain entity.
   */
  protected toEntity(
    data: (IPendingTutor & Document<unknown>) | null,
  ): PendingTutor | null {
    if (!data) return null;

    return new PendingTutor(
      data.email,
      data.name,
      data.knownLanguages,
      data.yearsOfExperience,
      data.password,
      data.createdAt,
      data.updatedAt,
      String(data._id),
      data.googleId,
    );
  }
}
