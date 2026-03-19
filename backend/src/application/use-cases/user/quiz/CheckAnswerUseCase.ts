import { IQuizRepository } from '~repository-interfaces/IQuizRepository';
import { ICheckAnswerUseCase } from '~use-case-interfaces/user/ICheckAnswerUseCase';

export class CheckAnswerUseCase implements ICheckAnswerUseCase {
  constructor(private _quizRepository: IQuizRepository) {}

  async execute(
    userId: string,
    quizId: string,
    questionIndex: number,
    selectedOption: number,
    timeTaken: number,
  ): Promise<{
    isCorrect: boolean;
    correctAnswerIndex: number;
    explanation: string;
  }> {
    const quiz = await this._quizRepository.findOneById(quizId);

    if (!quiz || quiz.userId !== userId) {
      throw new Error('Quiz not found');
    }

    if (quiz.isCompleted) {
      throw new Error('This quiz is already completed');
    }

    const question = quiz.questions[questionIndex];
    if (!question) {
      throw new Error('Question not found');
    }

    const isCorrect = question.correctAnswerIndex === selectedOption;

    const updateData: any = {
      totalTimeTaken: quiz.totalTimeTaken + timeTaken,
    };

    if (isCorrect) {
      updateData.correctAnswersValue = quiz.correctAnswersValue + 1;
      updateData.score = quiz.score + 10;
    }

    await this._quizRepository.updateOneById(quizId, updateData);

    return {
      isCorrect,
      correctAnswerIndex: question.correctAnswerIndex,
      explanation: question.explanation,
    };
  }
}
