import { NextFunction, Request, Response } from 'express';
import { IGenerateQuizUseCase } from '~use-case-interfaces/user/IGenerateQuizUseCase';
import { ICheckAnswerUseCase } from '~use-case-interfaces/user/ICheckAnswerUseCase';
import { ICompleteQuizUseCase } from '~use-case-interfaces/user/ICompleteQuizUseCase';
import { IGetQuizHistoryUseCase } from '~use-case-interfaces/user/IGetQuizHistoryUseCase';
import { IGetQuizLeaderboardUseCase } from '~use-case-interfaces/user/IGetQuizLeaderboardUseCase';
import { GenerateQuizSchema, CheckAnswerSchema, CompleteQuizSchema } from '~dtos/QuizDTOs';
import { QuizMapper } from '~mappers/QuizMapper';
import { logger } from '~logger/logger';
import { httpStatusCode } from '~constants/httpStatusCode';
import { errorMessage } from '~constants/errorMessage';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export class QuizController {
  constructor(
    private _generateQuizUseCase: IGenerateQuizUseCase,
    private _checkAnswerUseCase: ICheckAnswerUseCase,
    private _completeQuizUseCase: ICompleteQuizUseCase,
    private _getQuizHistoryUseCase: IGetQuizHistoryUseCase,
    private _getQuizLeaderboardUseCase: IGetQuizLeaderboardUseCase,
  ) {}

  generateQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = GenerateQuizSchema.parse(req.body);
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.id;

      if (!userId) {
        res.status(httpStatusCode.UNAUTHORIZED).json({
          success: false,
          message: errorMessage.UNAUTHORIZED,
        });
        return;
      }

      const quiz = await this._generateQuizUseCase.execute(
        userId,
        validatedData.language,
        validatedData.difficulty,
        validatedData.volume,
      );

      res.status(httpStatusCode.CREATED).json({
        success: true,
        data: QuizMapper.toPlayResponseDTO(quiz),
      });
    } catch (error: unknown) {
      logger.error('Error generating quiz:', error);
      next(error);
    }
  };

  checkAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = CheckAnswerSchema.parse(req.body);
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.id;

      if (!userId) {
        res.status(httpStatusCode.UNAUTHORIZED).json({
          success: false,
          message: errorMessage.UNAUTHORIZED,
        });
        return;
      }

      const result = await this._checkAnswerUseCase.execute(
        userId,
        validatedData.quizId,
        validatedData.questionIndex,
        validatedData.selectedOption,
        validatedData.timeTaken,
      );

      res.status(httpStatusCode.OK).json({
        success: true,
        data: result,
      });
    } catch (error: unknown) {
      logger.error('Error checking answer:', error);
      next(error);
    }
  };

  completeQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = CompleteQuizSchema.parse(req.body);
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.id;

      if (!userId) {
        res.status(httpStatusCode.UNAUTHORIZED).json({
          success: false,
          message: errorMessage.UNAUTHORIZED,
        });
        return;
      }

      const quiz = await this._completeQuizUseCase.execute(
        userId,
        validatedData.quizId,
      );

      res.status(httpStatusCode.OK).json({
        success: true,
        data: QuizMapper.toBriefResponseDTO(quiz),
      });
    } catch (error: unknown) {
      logger.error('Error completing quiz:', error);
      next(error);
    }
  };

  getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.id;

      if (!userId) {
        res.status(httpStatusCode.UNAUTHORIZED).json({
          success: false,
          message: errorMessage.UNAUTHORIZED,
        });
        return;
      }

      const history = await this._getQuizHistoryUseCase.execute(userId, page, limit);

      res.status(httpStatusCode.OK).json({
        success: true,
        data: history.map(QuizMapper.toBriefResponseDTO),
      });
    } catch (error: unknown) {
      logger.error('Error fetching quiz history:', error);
      next(error);
    }
  };

  getLeaderboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const leaderboard = await this._getQuizLeaderboardUseCase.execute(page, limit);

      res.status(httpStatusCode.OK).json({
        success: true,
        data: leaderboard.map(QuizMapper.toLeaderboardResponseDTO),
      });
    } catch (error: unknown) {
      logger.error('Error fetching leaderboard:', error);
      next(error);
    }
  };
}
