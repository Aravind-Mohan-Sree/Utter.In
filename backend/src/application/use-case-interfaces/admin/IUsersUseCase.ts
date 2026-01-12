import { UserResponseDTO } from '~mappers/UserMapper';

export interface IFetchUsersUseCase {
  execute(data: {
    page: number;
    limit: number;
    query: string;
    filter: string;
  }): Promise<{
    totalUsersCount: number;
    filteredUsersCount: number;
    users: UserResponseDTO[];
  }>;
}
