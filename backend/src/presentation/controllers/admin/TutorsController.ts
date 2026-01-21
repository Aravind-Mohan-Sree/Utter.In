import { NextFunction, Request, Response } from 'express';
import { httpStatusCode } from '~constants/httpStatusCode';
import { successMessage } from '~constants/successMessage';
import { ApproveTutorDTO } from '~dtos/ApproveTutorDTO';
import { FetchAdminUsersDTO } from '~dtos/FetchAdminUsersDTO';
import { RejectTutorDTO } from '~dtos/RejectTutorDTO';
import { logger } from '~logger/logger';
import {
  IApproveUseCase,
  IFetchTutorsUseCase,
  IRejectUseCase,
  IToggleStatusUseCase,
} from '~use-case-interfaces/admin/ITutorsUseCase';
import { IDeleteFileUseCase } from '~use-case-interfaces/shared/IFileUseCase';

interface TutorQuery {
  page: string;
  limit: string;
  query: string;
  filter: string;
}

export class TutorsController {
  constructor(
    private fetchTutorsUC: IFetchTutorsUseCase,
    private toggleStatusUC: IToggleStatusUseCase,
    private approveUC: IApproveUseCase,
    private rejectUC: IRejectUseCase,
    private deleteFileUC: IDeleteFileUseCase,
  ) {}

  fetchTutors = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, query, filter } = new FetchAdminUsersDTO(
        req.query as unknown as TutorQuery,
      );
      const tutorsData = await this.fetchTutorsUC.execute({
        page,
        limit,
        query,
        filter,
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

  toggleStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.toggleStatusUC.execute(id);

      res.status(httpStatusCode.OK).json({
        message: successMessage.STATUS_UPDATED,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  approve = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, certificationType } = new ApproveTutorDTO({
        id: req.params.id as string,
        certificationType: req.query.certificationType as string,
      });

      await this.approveUC.execute(id, certificationType);

      res.status(httpStatusCode.OK).json({
        message: successMessage.VERIFIED,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  reject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, rejectionReason } = new RejectTutorDTO({
        id: req.params.id as string,
        rejectionReason: req.query.rejectionReason as string,
      });

      await this.rejectUC.execute(id, rejectionReason);
      await this.deleteFileUC.execute('tutors/avatars/', id, 'image/jpeg');
      await this.deleteFileUC.execute('tutors/videos/', id, 'video/mp4');
      await this.deleteFileUC.execute(
        'tutors/certificates/',
        id,
        'application/pdf',
      );

      res.status(httpStatusCode.OK).json({
        message: successMessage.VERIFIED,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
