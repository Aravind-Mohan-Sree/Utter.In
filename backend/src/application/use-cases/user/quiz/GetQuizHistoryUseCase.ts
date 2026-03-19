import { IQuizRepository } from '~repository-interfaces/IQuizRepository';
import { IGetQuizHistoryUseCase } from '~use-case-interfaces/user/IGetQuizHistoryUseCase';
import { Quiz } from '~entities/Quiz';

export class GetQuizHistoryUseCase implements IGetQuizHistoryUseCase {
  constructor(private _quizRepository: IQuizRepository) {}

  async execute(userId: string, page: number, limit: number): Promise<Quiz[]> {
    const skip = (page - 1) * limit;
    return this._quizRepository.getUserAttempts(userId, skip, limit);
  }
}
