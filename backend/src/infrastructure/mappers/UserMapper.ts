import { IUser } from '~models/UserModel';

export class UserMapper {
  static toEntity(doc: IUser) {
    return {
      id: String(doc._id),
      name: doc.name,
      email: doc.email,
      knownLanguages: doc.knownLanguages,
      password: doc.password,
      role: doc.role,
      isBlocked: doc.isBlocked,
      googleId: doc.googleId,
      streak: doc.streak,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
