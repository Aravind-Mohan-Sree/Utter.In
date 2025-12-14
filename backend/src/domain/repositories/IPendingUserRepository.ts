import { PendingUser } from '~entities/PendingUser';
import { IBaseRepository } from './IBaseRepository';
import { IPendingUser } from '~models/PendingUserModel';

export interface IPendingUserRepository extends IBaseRepository<PendingUser, IPendingUser> {
  // findPendingUser(email: string): Promise<PendingUser | null>;
  // updateOtp(email: string, otp: string): Promise<boolean>;
}