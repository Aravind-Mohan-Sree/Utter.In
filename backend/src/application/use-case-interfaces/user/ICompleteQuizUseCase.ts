import { Quiz } from '~entities/Quiz';

export interface ICompleteQuizUseCase {
  execute(userId: string, quizId: string): Promise<Quiz>;
}
