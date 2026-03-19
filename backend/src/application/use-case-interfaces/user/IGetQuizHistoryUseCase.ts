import { Quiz } from '~entities/Quiz';

export interface IGetQuizHistoryUseCase {
  execute(userId: string, page: number, limit: number): Promise<Quiz[]>;
}
