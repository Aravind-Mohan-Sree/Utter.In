import { Admin } from '~entities/Admin';

export class AdminMapper {
  static toResponse(user: Admin) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}

export type AdminResponseDTO = ReturnType<typeof AdminMapper.toResponse>;
