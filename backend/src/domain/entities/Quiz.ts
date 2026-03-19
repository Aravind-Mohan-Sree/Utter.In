export interface IQuestion {
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export class Quiz {
  constructor(
    public userId: string,
    public language: string,
    public difficulty: string,
    public volume: number,
    public questions: IQuestion[],
    public score: number,
    public totalQuestions: number,
    public correctAnswersValue: number,
    public totalTimeTaken: number,
    public isCompleted: boolean,
    public startedAt: Date,
    public completedAt: Date | null,
    public id?: string,
  ) {}
}
