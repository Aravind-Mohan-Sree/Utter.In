import { z } from 'zod';

export const GenerateQuizSchema = z.object({
  language: z.string().min(1, 'Language is required'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  volume: z.number().int().min(5).max(20),
});

export type GenerateQuizDTO = z.infer<typeof GenerateQuizSchema>;

export const CheckAnswerSchema = z.object({
  quizId: z.string().min(1, 'Quiz ID is required'),
  questionIndex: z.number().int().min(0),
  selectedOption: z.number().int().min(-1).max(3),
  timeTaken: z.number().min(0),
});

export type CheckAnswerDTO = z.infer<typeof CheckAnswerSchema>;

export const CompleteQuizSchema = z.object({
  quizId: z.string().min(1, 'Quiz ID is required'),
});

export type CompleteQuizDTO = z.infer<typeof CompleteQuizSchema>;

export const QuizQuerySchema = z.object({
  page: z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return 1;
    return val;
  }, z.coerce.number().min(1).default(1)),
  limit: z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return 10;
    return val;
  }, z.coerce.number().min(1).max(50).default(10)),
});

export type QuizQueryDTO = z.infer<typeof QuizQuerySchema>;
