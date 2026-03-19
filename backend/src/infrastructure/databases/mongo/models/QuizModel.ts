import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface IQuiz extends Document {
  userId: mongoose.Types.ObjectId;
  language: string;
  difficulty: string;
  volume: number;
  questions: IQuestion[];
  score: number;
  totalQuestions: number;
  correctAnswersValue: number;
  totalTimeTaken: number;
  isCompleted: boolean;
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const quizSchema = new Schema<IQuiz>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    language: { type: String, required: true },
    difficulty: { type: String, required: true },
    volume: { type: Number, required: true },
    questions: [
      {
        text: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswerIndex: { type: Number, required: true },
        explanation: { type: String, required: true },
      },
    ],
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, required: true },
    correctAnswersValue: { type: Number, default: 0 },
    totalTimeTaken: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const QuizModel = mongoose.model<IQuiz>('quizzes', quizSchema);
