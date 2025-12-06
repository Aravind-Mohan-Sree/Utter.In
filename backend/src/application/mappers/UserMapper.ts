import { User } from '~entities/User';

export class UserMapper {
  static toResponse(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      knownLanguages: user.knownLanguages,
      role: user.role,
      isBlocked: user.isBlocked,
      googleId: user.googleId,
      streak: user.streak,
    };
  }
}
