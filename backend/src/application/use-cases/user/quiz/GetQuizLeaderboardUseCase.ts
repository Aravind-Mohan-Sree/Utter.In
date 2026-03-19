import { IQuizRepository } from '~repository-interfaces/IQuizRepository';
import { IGetQuizLeaderboardUseCase } from '~use-case-interfaces/user/IGetQuizLeaderboardUseCase';

export class GetQuizLeaderboardUseCase implements IGetQuizLeaderboardUseCase {
  constructor(private _quizRepository: IQuizRepository) {}

  async execute(page: number, limit: number): Promise<any[]> {
    const skip = (page - 1) * limit;
    return this._quizRepository.getLeaderboard(skip, limit);
  }
}