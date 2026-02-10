import { NextFunction, Request, Response } from 'express';
import { CreateSessionDTO } from '~dtos/CreateSessionDTO';
import { httpStatusCode } from '~constants/httpStatusCode';
import {
    ICancelSessionUseCase,
    ICreateSessionUseCase,
    IGetSessionsUseCase
} from '~use-case-interfaces/tutor/ISessionUseCase';
import { logger } from '~logger/logger';

export class SessionController {
    constructor(
        private createSessionUseCase: ICreateSessionUseCase,
        private getSessionsUseCase: IGetSessionsUseCase,
        private cancelSessionUseCase: ICancelSessionUseCase
    ) { }

    createSession = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.user as { id: string };
            const data = new CreateSessionDTO({ ...req.body, tutorId: id });

            const session = await this.createSessionUseCase.execute(data);

            res.status(httpStatusCode.CREATED).json(session);
        } catch (error) {
            logger.error(error);
            next(error);
        }
    }

    getSessions = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.user as { id: string };
            const date = req.query.date as string;

            if (!date) {
                res.status(httpStatusCode.BAD_REQUEST).json({ message: 'Date is required' });
                return;
            }

            const sessions = await this.getSessionsUseCase.execute(id, date);
            res.status(httpStatusCode.OK).json({ sessions });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    }

    cancelSession = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.user as { id: string };
            const sessionId = req.params.sessionId;

            await this.cancelSessionUseCase.execute(sessionId, id);

            res.status(httpStatusCode.OK).json({ message: 'Session cancelled successfully' });
        } catch (error) {
            logger.error(error);
            next(error);
        }
    }
}
