import { User } from '~entities/User';

export class UserMapper {
  static toResponse(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      knownLanguages: user.knownLanguages,
      bio: user.bio,
      role: user.role,
      isBlocked: user.isBlocked,
      streak: user.streak,
      createdAt: user.createdAt,
    };
  }
}

export type UserResponseDTO = ReturnType<typeof UserMapper.toResponse>;
