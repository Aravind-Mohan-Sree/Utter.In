import { NextFunction, Request, Response } from 'express';
import { ICreateAbuseReportUseCase, IGetUserAbuseReportsUseCase } from '~use-case-interfaces/user/IAbuseReportUseCase';
import { logger } from '~logger/logger';
import { IValidateDataService } from '~service-interfaces/IValidateDataService';
import { CreateAbuseReportDTO } from '~dtos/AbuseReportDTO';
import { AbuseReportMapper } from '~mappers/AbuseReportMapper';

export class UserAbuseReportController {
  constructor(
    private _createAbuseReportUseCase: ICreateAbuseReportUseCase,
    private _getUserAbuseReportsUseCase: IGetUserAbuseReportsUseCase,
    private _validator: IValidateDataService,
  ) { }

  createReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = new CreateAbuseReportDTO(req.body, this._validator);
      const reporterId = req.user!.id;
      
      const report = await this._createAbuseReportUseCase.execute(
        reporterId,
        dto.reportedId,
        dto.type,
        dto.description,
        dto.messages,
        dto.channel,
      );

      return res.status(201).json({
        success: true,
        report,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  getMyReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { page, limit, status } = req.query;

      const result = await this._getUserAbuseReportsUseCase.execute(
        userId,
        Number(page) || 1,
        Number(limit) || 10,
        status as string,
      );

      return res.status(200).json({
        success: true,
        reports: result.reports.map(report => AbuseReportMapper.toUserResponse(report)),
        total: result.total,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
