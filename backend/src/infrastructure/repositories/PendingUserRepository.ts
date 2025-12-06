import { PendingUser } from '~entities/PendingUser';
import { BaseRepository } from './BaseRepository';
import { IPendingUser, PendingUserModel } from '~models/PendingUserModel';
import { IPendingUserRepository } from '~domain-repositories/IPendingUserRepository';
import { Document } from 'mongoose';

export class PendingUserRepository
  extends BaseRepository<PendingUser, IPendingUser>
  implements IPendingUserRepository
{
  constructor() {
    super(PendingUserModel);
  }

  async findPendingUser(email: string): Promise<PendingUser | null> {
    const user = await PendingUserModel.findOne({ email });

    if (!user) return null;

    return this.toEntity(user);
  }

  async updateOtp(email: string, otp: string): Promise<boolean> {
    const result = await PendingUserModel.updateOne(
      { email },
      { $set: { otp } },
    );

    return result.acknowledged;
  }

  protected toEntity(
    data: (IPendingUser & Document<unknown>) | null,
  ): PendingUser | null {
    if (!data) return null;

    return new PendingUser(
      data.name,
      data.email,
      data.knownLanguages,
      data.password,
      data.otp,
    );
  }
}
