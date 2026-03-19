export interface ICheckAnswerUseCase {
  execute(
    userId: string,
    quizId: string,
    questionIndex: number,
    selectedOption: number,
    timeTaken: number
  ): Promise<{
    isCorrect: boolean;
    correctAnswerIndex: number;
    explanation: string;
  }>;
}
