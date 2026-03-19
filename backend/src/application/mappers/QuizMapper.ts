import { Quiz } from '~entities/Quiz';
import { IUser } from '~models/UserModel';

export class QuizMapper {
  static toBriefResponseDTO(quiz: Quiz) {
    return {
      id: quiz.id,
      language: quiz.language,
      difficulty: quiz.difficulty,
      volume: quiz.volume,
      score: quiz.score,
      totalQuestions: quiz.totalQuestions,
      correctAnswers: quiz.correctAnswersValue,
      totalTimeTaken: quiz.totalTimeTaken,
      isCompleted: quiz.isCompleted,
      startedAt: quiz.startedAt,
      completedAt: quiz.completedAt,
    };
  }

  static toPlayResponseDTO(quiz: Quiz) {
    return {
      id: quiz.id,
      language: quiz.language,
      difficulty: quiz.difficulty,
      volume: quiz.volume,
      questions: quiz.questions.map((q) => ({
        text: q.text,
        options: q.options,
      })),
      isCompleted: quiz.isCompleted,
      startedAt: quiz.startedAt,
    };
  }

  static toLeaderboardResponseDTO(user: IUser) {
    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      streak: user.streak,
      quizStats: user.quizStats,
    };
  }
}
