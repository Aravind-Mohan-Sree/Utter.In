import { PendingUser } from '~entities/PendingUser';
import { IBaseRepository } from './IBaseRepository';
import { IPendingUser } from '~models/PendingUserModel';

export interface IPendingUserRepository extends IBaseRepository<
  PendingUser,
  IPendingUser
> {}
