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
import { contentTypes, filePrefixes } from '~constants/fileConstants';

interface TutorQuery {
  page: string;
  limit: string;
  query: string;
  filter: string;
}

export class TutorsController {
  constructor(
    private _fetchTutorsUC: IFetchTutorsUseCase,
    private _toggleStatusUC: IToggleStatusUseCase,
    private _approveUC: IApproveUseCase,
    private _rejectUC: IRejectUseCase,
    private _updateFileUC: IUpdateFileUseCase,
    private _deleteFileUC: IDeleteFileUseCase,
  ) {}

  fetchTutors = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, query, filter } = new FetchAdminUsersDTO(
        req.query as unknown as TutorQuery,
      );
      const tutorsData = await this._fetchTutorsUC.execute({
        page,
        limit,
        query,
        filter,
      });

      res.status(httpStatusCode.OK).json({
        message: successMessage.DATA_FETCH_SUCCESS,
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
      await this._toggleStatusUC.execute(id);

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

      await this._approveUC.execute(id, certificationType);

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

      const googleId = await this._rejectUC.execute(id, rejectionReason);

      if (googleId) {
        await this._updateFileUC.execute(
          filePrefixes.TUTOR_AVATAR,
          filePrefixes.TEMP_REJECTED_TUTOR_AVATAR,
          id,
          id,
          contentTypes.IMAGE_JPEG,
        );
      }

      await this._updateFileUC.execute(
        dueToVideo ? filePrefixes.TUTOR_CERTIFICATE : filePrefixes.TUTOR_VIDEO,
        dueToVideo
          ? filePrefixes.TEMP_REJECTED_TUTOR_CERTIFICATE
          : filePrefixes.TEMP_REJECTED_TUTOR_VIDEO,
        id,
        id,
        dueToVideo ? contentTypes.APPLICATION_PDF : contentTypes.VIDEO_MP4,
      );
      await this._deleteFileUC.execute(
        dueToVideo ? filePrefixes.TUTOR_VIDEO : filePrefixes.TUTOR_CERTIFICATE,
        id,
        dueToVideo ? contentTypes.VIDEO_MP4 : contentTypes.APPLICATION_PDF,
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
