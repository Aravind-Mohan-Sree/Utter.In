import { User } from '~entities/User';
import { IBaseRepository } from './IBaseRepository';
import { IUser } from '~models/UserModel';

export interface IUserRepository extends IBaseRepository<User, IUser> {
  fetchUsers(
    page: number,
    limit: number,
    query: string,
    filter: string,
  ): Promise<{ totalUsers: number; users: User[] }>;
}
