import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { IQuestion } from '~entities/Quiz';
import { IGeminiService } from '../domain/services/IGeminiService';
import { env } from '../config/env';

export class GeminiService implements IGeminiService {
  private _genAI: GoogleGenerativeAI;
  private _model: GenerativeModel;

  constructor() {
    this._genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    this._model = this._genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite-preview',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });
  }

  async generateQuiz(
    language: string,
    difficulty: string,
    volume: number,
  ): Promise<IQuestion[]> {
    const prompt = `Generate a language learning quiz for ${language} at ${difficulty} difficulty.
    Volume: ${volume} questions.
    Each question must have:
    - text: The question text.
    - options: 4 distinct choices.
    - correctAnswerIndex: Index (0-3) of the correct answer.
    - explanation: A brief context for why the answer is correct.
    
    Return the response as a JSON array of objects following this structure:
    [
      {
        "text": "...",
        "options": ["...", "...", "...", "..."],
        "correctAnswerIndex": 0,
        "explanation": "..."
      }
    ]`;

    try {
      const result = await this._model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      return JSON.parse(text) as IQuestion[];
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate quiz: ${error.message}`);
      }
      throw new Error('Failed to generate quiz via Gemini API');
    }
  }
}
