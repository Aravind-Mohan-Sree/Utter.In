import { IUser } from '~models/UserModel';

export interface IGetQuizLeaderboardUseCase {
  execute(page: number, limit: number): Promise<IUser[]>;
}
