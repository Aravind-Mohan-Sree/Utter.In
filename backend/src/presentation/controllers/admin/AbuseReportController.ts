import { NextFunction, Request, Response } from 'express';
import { IGetAbuseReportsUseCase, IHandleAbuseReportUseCase } from '~use-case-interfaces/admin/IAbuseReportUseCase';
import { logger } from '~logger/logger';
import { AbuseReportMapper } from '~mappers/AbuseReportMapper';

/**
 * Controller for admin-level abuse report management.
 * Allows admins to view submitted reports and resolve or reject them.
 */
export class AdminAbuseReportController {
  constructor(
    private _getAbuseReportsUseCase: IGetAbuseReportsUseCase,
    private _handleAbuseReportUseCase: IHandleAbuseReportUseCase,
  ) { }

  /**
   * Retrieves a list of abuse reports with pagination and filtering.
   */
  getReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, search, status } = req.query;
      const result = await this._getAbuseReportsUseCase.execute(
        Number(page) || 1,
        Number(limit) || 10,
        search as string,
        status as string,
      );

      return res.status(200).json({
        success: true,
        reports: result.reports.map(report => AbuseReportMapper.toAdminResponse(report)),
        total: result.total,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  /**
   * Updates the status of an abuse report (Resolving usually leads to a block).
   */
  handleReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reportId } = req.params;
      const { status, rejectionReason } = req.body;

      const report = await this._handleAbuseReportUseCase.execute(reportId, status, rejectionReason);

      return res.status(200).json({
        success: true,
        report: AbuseReportMapper.toAdminResponse(report),
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
