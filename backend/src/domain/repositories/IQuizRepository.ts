import { Quiz } from '../entities/Quiz';
import { IBaseRepository } from './IBaseRepository';
import { IQuiz } from '~models/QuizModel';

export interface IQuizRepository extends IBaseRepository<Quiz, IQuiz> {
  getUserAttempts(userId: string, skip: number, limit: number): Promise<Quiz[]>;
  getLeaderboard(skip: number, limit: number): Promise<any[]>;
}
