import { IUser, UserModel } from '~models/UserModel';
import { BaseRepository } from './BaseRepository';
import { User } from '~entities/User';
import { IUserRepository } from '~domain-repositories/IUserRepository';
import { Document } from 'mongoose';

export class UserRepository
  extends BaseRepository<User, IUser>
  implements IUserRepository
{
  constructor() {
    super(UserModel);
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email });

    if (!doc) return null;

    return this.toEntity(doc);
  }

  protected toEntity(doc: (IUser & Document<unknown>) | null): User | null {
    if (!doc) return null;

    return new User(
      doc.name,
      doc.email,
      doc.knownLanguages,
      doc.password,
      doc.createdAt,
      doc.updatedAt,
      doc.bio,
      String(doc._id),
      doc.role,
      doc.isBlocked,
      doc.googleId,
      doc.streak,
    );
  }
}
