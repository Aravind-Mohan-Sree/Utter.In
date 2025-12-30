import { PendingTutor } from '~entities/PendingTutor';
import { BaseRepository } from './BaseRepository';
import { IPendingTutor, PendingTutorModel } from '~models/PendingTutorModel';
import { IPendingTutorRepository } from '~repository-interfaces/IPendingTutorRepository';
import { Document } from 'mongoose';

export class PendingTutorRepository
  extends BaseRepository<PendingTutor, IPendingTutor>
  implements IPendingTutorRepository
{
  constructor() {
    super(PendingTutorModel);
  }

  protected toSchema(
    entity: PendingTutor | Partial<PendingTutor>,
  ): IPendingTutor | Partial<IPendingTutor> {
    return {
      name: entity.name!,
      email: entity.email,
      knownLanguages: entity.knownLanguages!,
      yearsOfExperience: entity.yearsOfExperience!,
      password: entity.password!,
      otp: entity.otp!,
      createdAt: entity.createdAt!,
      updatedAt: entity.updatedAt!,
    };
  }

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
      data.otp,
      data.createdAt,
      data.updatedAt,
      String(data._id),
    );
  }
}
