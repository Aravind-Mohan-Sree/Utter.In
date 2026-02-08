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
import {
  IDeleteFileUseCase,
  IUpdateFileUseCase,
} from '~use-case-interfaces/shared/IFileUseCase';

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
    private updateFileUC: IUpdateFileUseCase,
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
      const dueToVideo = rejectionReason.split('/')[0] === 'video';

      const googleId = await this.rejectUC.execute(id, rejectionReason);

      if (googleId) {
        await this.updateFileUC.execute(
          'tutors/avatars/',
          'temp/rejected-tutors/avatars/',
          id,
          id,
          'image/jpeg',
        );
      }

      await this.updateFileUC.execute(
        dueToVideo ? 'tutors/certificates/' : 'tutors/videos/',
        dueToVideo
          ? 'temp/rejected-tutors/certificates/'
          : 'temp/rejected-tutors/videos/',
        id,
        id,
        dueToVideo ? 'application/pdf' : 'video/mp4',
      );
      await this.deleteFileUC.execute(
        dueToVideo ? 'tutors/videos/' : 'tutors/certificates/',
        id,
        dueToVideo ? 'video/mp4' : 'application/pdf',
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
