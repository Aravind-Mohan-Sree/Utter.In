import { IUser, UserModel } from '~models/UserModel';
import { BaseRepository } from './BaseRepository';
import { User } from '~entities/User';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { Document } from 'mongoose';

export class UserRepository
  extends BaseRepository<User, IUser>
  implements IUserRepository
{
  constructor() {
    super(UserModel);
  }

  protected toSchema(entity: User | Partial<User>): IUser | Partial<IUser> {
    return {
      name: entity.name,
      email: entity.email,
      knownLanguages: entity.knownLanguages,
      bio: entity.bio,
      password: entity.password,
      role: entity.role,
      isBlocked: entity.isBlocked,
      googleId: entity.googleId!,
      streak: entity.streak!,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  protected toEntity(doc: (IUser & Document<unknown>) | null): User | null {
    if (!doc) return null;

    return new User(
      doc.name,
      doc.email,
      doc.knownLanguages,
      doc.bio,
      doc.password,
      doc.googleId,
      doc.streak,
      doc.role,
      doc.isBlocked,
      String(doc._id),
      doc.createdAt,
      doc.updatedAt,
    );
  }
}
