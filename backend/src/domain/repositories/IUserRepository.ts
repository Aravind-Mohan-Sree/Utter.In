import { User } from '~entities/User';
import { IBaseRepository } from './IBaseRepository';
import { IUser } from '~models/UserModel';

export interface IUserRepository extends IBaseRepository<User, IUser> {
  // findByEmail(email: string): Promise<User | null>;
}
