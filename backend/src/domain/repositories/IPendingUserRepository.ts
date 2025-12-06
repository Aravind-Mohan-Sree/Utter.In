import { PendingUser } from '~entities/PendingUser';
import { IBaseRepository } from './IBaseRepository';

export interface IPendingUserRepository extends IBaseRepository<PendingUser> {
  findPendingUser(email: string): Promise<PendingUser | null>;
  updateOtp(email: string, otp: string): Promise<boolean>;
}