import { Document, Types } from 'mongoose';
import { Quiz } from '~entities/Quiz';
import { IQuiz, QuizModel } from '~models/QuizModel';
import { IQuizRepository } from '~repository-interfaces/IQuizRepository';
import { BaseRepository } from './BaseRepository';
import { UserModel, IUser } from '~models/UserModel';

/**
 * Concrete repository for Quiz entities using Mongoose.
 * Manages user quiz attempts and provides leaderboard statistics.
 */
export class QuizRepository
  extends BaseRepository<Quiz, IQuiz>
  implements IQuizRepository
{
  constructor() {
    super(QuizModel);
  }

  /**
   * Retrieves completed quiz attempts for a specific user with pagination.
   */
  async getUserAttempts(
    userId: string,
    skip: number,
    limit: number,
  ): Promise<Quiz[]> {
    const docs = await this.model
      .find({ userId: new Types.ObjectId(userId), isCompleted: true })
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit);

    return docs.map((doc) => this.toEntity(doc)) as Quiz[];
  }

  /**
   * Generates a leaderboard of users based on their streaks and quiz performance.
   */
  async getLeaderboard(skip: number, limit: number): Promise<IUser[]> {
    const users = await UserModel.find({ role: 'user', isBlocked: false })
      .sort({
        'streak.currentStreak': -1,
        'quizStats.averageAccuracy': -1,
        'quizStats.averageSpeed': 1,
      })
      .skip(skip)
      .limit(limit)
      .select('name email streak quizStats');

    return users;
  }

  /**
   * Internal mapper to convert domain entity to Mongoose schema object.
   */
  protected toSchema(entity: Quiz | Partial<Quiz>): IQuiz | Partial<IQuiz> {
    return {
      userId: entity.userId ? new Types.ObjectId(entity.userId) : undefined,
      language: entity.language,
      difficulty: entity.difficulty,
      volume: entity.volume,
      questions: entity.questions,
      score: entity.score,
      totalQuestions: entity.totalQuestions,
      correctAnswersValue: entity.correctAnswersValue,
      totalTimeTaken: entity.totalTimeTaken,
      isCompleted: entity.isCompleted,
      startedAt: entity.startedAt,
      completedAt: entity.completedAt,
    };
  }

  /**
   * Internal mapper to convert Mongoose document to domain entity.
   */
  protected toEntity(doc: (IQuiz & Document) | null): Quiz | null {
    if (!doc) return null;

    return new Quiz(
      String(doc.userId),
      doc.language,
      doc.difficulty,
      doc.volume,
      doc.questions,
      doc.score,
      doc.totalQuestions,
      doc.correctAnswersValue,
      doc.totalTimeTaken,
      doc.isCompleted,
      doc.startedAt,
      doc.completedAt,
      String(doc._id),
    );
  }
}
