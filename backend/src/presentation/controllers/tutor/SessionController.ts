import { NextFunction, Request, Response } from 'express';
import { CreateSessionDTO } from '~dtos/CreateSessionDTO';
import { httpStatusCode } from '~constants/httpStatusCode';
import {
  ICancelSessionUseCase,
  ICreateSessionUseCase,
  IGetSessionsUseCase,
} from '~use-case-interfaces/tutor/ISessionUseCase';
import { logger } from '~logger/logger';

/**
 * Controller for tutors to manage their teaching sessions.
 * Handles creation, retrieval by date, and cancellation of sessions.
 */
export class SessionController {
  constructor(
        private _createSessionUseCase: ICreateSessionUseCase,
        private _getSessionsUseCase: IGetSessionsUseCase,
        private _cancelSessionUseCase: ICancelSessionUseCase,
  ) { }

  /**
   * Creates a new available session for the tutor.
   */
  createSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.user as { id: string };
      const data = new CreateSessionDTO({ ...req.body, tutorId: id });

      const session = await this._createSessionUseCase.execute(data);

      res.status(httpStatusCode.CREATED).json(session);
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  /**
   * Retrieves all sessions created by the tutor for a specific date.
   */
  getSessions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.user as { id: string };
      const date = req.query.date as string;

      if (!date) {
        res.status(httpStatusCode.BAD_REQUEST).json({ message: 'Date is required' });
        return;
      }

      const sessions = await this._getSessionsUseCase.execute(id, date);
      res.status(httpStatusCode.OK).json({ sessions });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  /**
   * Cancels an existing session.
   */
  cancelSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.user as { id: string };
      const sessionId = req.params.sessionId;

      await this._cancelSessionUseCase.execute(sessionId, id);

      res.status(httpStatusCode.OK).json({ message: 'Session cancelled successfully' });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
