
import { NextFunction, Request, Response } from 'express';
import { httpStatusCode } from '~constants/httpStatusCode';
import { successMessage } from '~constants/successMessage';
import { logger } from '~logger/logger';
import { IFetchTutorsUseCase, IGetTutorSessionsUseCase } from '~use-case-interfaces/user/ITutorsUseCase';
import { FetchDataDTO } from '~dtos/FetchDataDTO';
import { IGetEntityDataUseCase } from '~use-case-interfaces/shared/IGetEntityDataUseCase';
import { Tutor } from '~entities/Tutor';
import { TutorMapper } from '~mappers/TutorMapper';


export class TutorsController {
  constructor(
        private fetchTutorsUC: IFetchTutorsUseCase,
        private getTutorDataUC: IGetEntityDataUseCase<Tutor>,
        private getTutorSessionsUC: IGetTutorSessionsUseCase,
  ) { }

  fetchTutors = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const queryData = new FetchDataDTO({
        page: req.query.page as string,
        limit: req.query.limit as string,
        query: req.query.query as string,
        sort: req.query.sort as string,
        language: req.query.language as string,
        filter: '',
      });

      const tutorsData = await this.fetchTutorsUC.execute({
        page: queryData.page,
        limit: queryData.limit,
        query: queryData.query,
        sort: queryData.sort,
        language: queryData.language,
      });

      res.status(httpStatusCode.OK).json({
        message: successMessage.DATA_FETCHED,
        tutorsData,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  getTutorDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tutorId = req.params.id;
      const tutor = await this.getTutorDataUC.getOneById(tutorId);

      if (!tutor) {
        throw new Error('Tutor not found');
      }

      const tutorDTO = TutorMapper.toResponse(tutor);

      res.status(httpStatusCode.OK).json({
        message: successMessage.DATA_FETCHED,
        tutor: tutorDTO,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  getTutorSessions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tutorId = req.params.id;
      const { date } = req.query;

      let startDate: Date | undefined;
      if (date) {
        startDate = new Date(date as string);
      }

      const sessions = await this.getTutorSessionsUC.execute(tutorId, startDate);

      res.status(httpStatusCode.OK).json({
        message: successMessage.DATA_FETCHED,
        sessions,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
