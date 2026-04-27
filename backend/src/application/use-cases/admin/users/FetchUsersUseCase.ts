import { UserMapper, UserResponseDTO } from '~mappers/UserMapper';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { IFetchUsersUseCase } from '~use-case-interfaces/admin/IUsersUseCase';

/**
 * Use case to fetch users for the admin dashboard.
 * Supports pagination, search queries, and status filtering.
 */
export class FetchUsersUseCase implements IFetchUsersUseCase {
  constructor(private _userRepo: IUserRepository) {}

  /**
   * Retrieves a paginated and filtered list of regular users.
   * @param data Object containing page, limit, search query, and filter criteria.
   * @returns Counts and mapped user data.
   */
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
    // Fetch data from repository with admin privileges
    const { totalUsersCount, filteredUsersCount, users } =
      await this._userRepo.fetchUsers(
        data.page,
        data.limit,
        data.query,
        data.filter,
        'newest',
        'All',
        undefined,
        true, // isAdmin flag
      );

    // Map entities to response DTOs
    const fetchedUsers = users.map(UserMapper.toResponse);

    return { totalUsersCount, filteredUsersCount, users: fetchedUsers };
  }
}
