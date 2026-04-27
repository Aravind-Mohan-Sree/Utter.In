import { PendingUser } from '~entities/PendingUser';
import { BaseRepository } from './BaseRepository';
import { IPendingUser, PendingUserModel } from '~models/PendingUserModel';
import { IPendingUserRepository } from '~repository-interfaces/IPendingUserRepository';
import { Document } from 'mongoose';

/**
 * Concrete repository for PendingUser entities using Mongoose.
 * Temporary storage for student registration data during OTP verification.
 */
export class PendingUserRepository
  extends BaseRepository<PendingUser, IPendingUser>
  implements IPendingUserRepository {
  constructor() {
    super(PendingUserModel);
  }

  /**
   * Internal mapper to convert domain entity to Mongoose schema object.
   */
  protected toSchema(
    entity: PendingUser | Partial<PendingUser>,
  ): IPendingUser | Partial<IPendingUser> {
    return {
      name: entity.name!,
      email: entity.email,
      knownLanguages: entity.knownLanguages!,
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
    data: (IPendingUser & Document<unknown>) | null,
  ): PendingUser | null {
    if (!data) return null;

    return new PendingUser(
      data.email,
      data.name,
      data.knownLanguages,
      data.password,
      data.createdAt,
      data.updatedAt,
      String(data._id),
      data.googleId,
    );
  }
}
