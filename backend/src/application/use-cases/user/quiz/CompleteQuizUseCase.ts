import { IQuizRepository } from '~repository-interfaces/IQuizRepository';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { ICompleteQuizUseCase } from '~use-case-interfaces/user/ICompleteQuizUseCase';
import { Quiz } from '~entities/Quiz';

export class CompleteQuizUseCase implements ICompleteQuizUseCase {
  constructor(
    private _quizRepository: IQuizRepository,
    private _userRepository: IUserRepository,
  ) {}

  async execute(userId: string, quizId: string): Promise<Quiz> {
    const quiz = await this._quizRepository.findOneById(quizId);
    if (!quiz || quiz.userId !== userId) {
      throw new Error('Quiz not found');
    }

    if (quiz.isCompleted) {
      return quiz;
    }

    const updatedQuiz = await this._quizRepository.updateOneById(quizId, {
      isCompleted: true,
      completedAt: new Date(),
    } as Partial<Quiz>);

    if (!updatedQuiz) {
      throw new Error('Failed to complete quiz');
    }

    const user = await this._userRepository.findOneById(userId);
    if (user) {
      const now = new Date();
      const lastActive = user.streak.lastActive
        ? new Date(user.streak.lastActive)
        : null;

      let currentStreak = user.streak.currentStreak || 0;
      let highestStreak = user.streak.highestStreak || 0;

      if (!lastActive) {
        currentStreak = 1;
      } else {
        const diffInDays = Math.floor(
          (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (diffInDays === 1) {
          // Played yesterday, increment streak
          currentStreak += 1;
        } else if (diffInDays > 1) {
          // Missed days, streak resets
          currentStreak = 1;
        } else if (diffInDays === 0) {
          // Already played today, streak stays the same
        }
      }

      if (currentStreak > highestStreak) {
        highestStreak = currentStreak;
      }

      const totalQuizzes = user.quizStats.totalQuizzes + 1;
      const quizAccuracy = (quiz.correctAnswersValue / quiz.totalQuestions) * 100;
      const quizSpeed = quiz.totalTimeTaken / quiz.totalQuestions;

      const newAverageAccuracy =
        (user.quizStats.averageAccuracy * user.quizStats.totalQuizzes +
          quizAccuracy) /
        totalQuizzes;

      const newAverageSpeed =
        (user.quizStats.averageSpeed * user.quizStats.totalQuizzes + quizSpeed) /
        totalQuizzes;

      await this._userRepository.updateOneById(userId, {
        streak: {
          lastActive: now,
          currentStreak,
          highestStreak,
        },
        quizStats: {
          totalQuizzes,
          averageAccuracy: newAverageAccuracy,
          averageSpeed: newAverageSpeed,
        },
      } as any);
    }

    return updatedQuiz;
  }
}
