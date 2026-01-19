import { PendingUser } from '~entities/PendingUser';
import { BaseRepository } from './BaseRepository';
import { IPendingUser, PendingUserModel } from '~models/PendingUserModel';
import { IPendingUserRepository } from '~repository-interfaces/IPendingUserRepository';
import { Document } from 'mongoose';

export class PendingUserRepository
  extends BaseRepository<PendingUser, IPendingUser>
  implements IPendingUserRepository
{
  constructor() {
    super(PendingUserModel);
  }

  protected toSchema(
    entity: PendingUser | Partial<PendingUser>,
  ): IPendingUser | Partial<IPendingUser> {
    return {
      name: entity.name!,
      email: entity.email,
      knownLanguages: entity.knownLanguages!,
      password: entity.password!,
      otp: entity.otp!,
      createdAt: entity.createdAt!,
      updatedAt: entity.updatedAt!,
    };
  }

  protected toEntity(
    data: (IPendingUser & Document<unknown>) | null,
  ): PendingUser | null {
    if (!data) return null;

    return new PendingUser(
      data.email,
      data.name,
      data.knownLanguages,
      data.password,
      data.otp,
      data.createdAt,
      data.updatedAt,
      String(data._id),
    );
  }
}
