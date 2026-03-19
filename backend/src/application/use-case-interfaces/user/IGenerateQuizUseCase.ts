import { Quiz } from '~entities/Quiz';

export interface IGenerateQuizUseCase {
  execute(userId: string, language: string, difficulty: string, volume: number): Promise<Quiz>;
}
