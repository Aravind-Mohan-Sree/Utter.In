import { UserMapper, UserResponseDTO } from '~mappers/UserMapper';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { IFetchUsersUseCase } from '~use-case-interfaces/admin/IUsersUseCase';

export class FetchUsersUseCase implements IFetchUsersUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(data: {
    page: number;
    limit: number;
    query: string;
    filter: string;
  }): Promise<{
    totalUsersCount: number;
    filteredUsersCount: number;
    users: UserResponseDTO[];
  }> {
    const { totalUsersCount, filteredUsersCount, users } =
      await this.userRepo.fetchUsers(
        data.page,
        data.limit,
        data.query,
        data.filter,
      );

    const fetchedUsers = users.map(UserMapper.toResponse);

    return { totalUsersCount, filteredUsersCount, users: fetchedUsers };
  }
}
