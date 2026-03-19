import { Quiz } from '~entities/Quiz';
import { IQuizRepository } from '~repository-interfaces/IQuizRepository';
import { IGeminiService } from '~service-interfaces/IGeminiService';
import { IGenerateQuizUseCase } from '~use-case-interfaces/user/IGenerateQuizUseCase';

export class GenerateQuizUseCase implements IGenerateQuizUseCase {
  constructor(
    private _quizRepository: IQuizRepository,
    private _geminiService: IGeminiService,
  ) { }

  async execute(
    userId: string,
    language: string,
    difficulty: string,
    volume: number,
  ): Promise<Quiz> {
    const questions = await this._geminiService.generateQuiz(
      language,
      difficulty,
      volume,
    );

    const quiz = new Quiz(
      userId,
      language,
      difficulty,
      volume,
      questions,
      0, // initial score
      volume, // total questions
      0, // correct answers
      0, // total time taken
      false, // isCompleted
      new Date(), // startedAt
      null, // completedAt
    );

    return this._quizRepository.create(quiz);
  }
}
