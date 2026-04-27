import { NextFunction, Request, Response } from 'express';
import { httpStatusCode } from '~constants/httpStatusCode';
import { successMessage } from '~constants/successMessage';
import { FetchAdminUsersDTO } from '~dtos/FetchAdminUsersDTO';
import { logger } from '~logger/logger';
import { IFetchUsersUseCase, IToggleStatusUseCase } from '~use-case-interfaces/admin/IUsersUseCase';

interface UserQuery {
  page: string;
  limit: string;
  query: string;
  filter: string;
}

/**
 * Controller for managing regular users from the admin panel.
 * Handles fetching paginated user lists and toggling account statuses.
 */
export class UsersController {
  constructor(
    private _fetchUsersUC: IFetchUsersUseCase,
    private _toggleStatusUC: IToggleStatusUseCase,
  ) {}

  /**
   * Fetches a paginated list of users with search and filter capabilities.
   */
  fetchUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, query, filter } = new FetchAdminUsersDTO(
        req.query as unknown as UserQuery,
      );
      const usersData = await this._fetchUsersUC.execute({
        page,
        limit,
        query,
        filter,
      });

      res.status(httpStatusCode.OK).json({
        message: successMessage.DATA_FETCH_SUCCESS,
        usersData,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  /**
   * Toggles the blocked status of a specific user.
   */
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
}
