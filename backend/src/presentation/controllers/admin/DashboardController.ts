import { NextFunction, Request, Response } from 'express';
import { IGetDashboardDataUseCase } from '~use-case-interfaces/admin/IDashboardUseCase';
import { logger } from '~logger/logger';
import { DashboardMapper } from '~mappers/DashboardMapper';

export class AdminDashboardController {
  constructor(private _getDashboardDataUseCase: IGetDashboardDataUseCase) {}

  getDashboardData = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const dashboardData = await this._getDashboardDataUseCase.execute();
      const response = DashboardMapper.toResponse(dashboardData);
      res.status(200).json(response);
    } catch (error) {
      logger.error('Dashboard data fetch failed:', error);
      next(error);
    }
  };
}
