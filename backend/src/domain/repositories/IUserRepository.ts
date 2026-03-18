import { User } from '~entities/User';
import { IBaseRepository } from './IBaseRepository';
import { IUser } from '~models/UserModel';

export interface IUserRepository extends IBaseRepository<User, IUser> {
  fetchUsers(
    page: number,
    limit: number,
    query: string,
    filter: string,
    sort: string,
    language: string,
    excludeId?: string,
    isAdmin?: boolean,
  ): Promise<{
    totalUsersCount: number;
    filteredUsersCount: number;
    users: User[];
  }>;
}
