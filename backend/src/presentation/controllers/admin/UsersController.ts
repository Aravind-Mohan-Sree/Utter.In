import { NextFunction, Request, Response } from 'express';
import { httpStatusCode } from '~constants/httpStatusCode';
import { successMessage } from '~constants/successMessage';
import { FetchAdminUsersDTO } from '~dtos/FetchAdminUsersDTO';
import { logger } from '~logger/logger';
import { IFetchUsersUseCase } from '~use-case-interfaces/admin/IUsersUseCase';

interface UserQuery {
  page: string;
  limit: string;
  query: string;
  filter: string;
}

export class UsersController {
  constructor(private fetchUsersUC: IFetchUsersUseCase) {}

  fetchUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, query, filter } = new FetchAdminUsersDTO(
        req.query as unknown as UserQuery,
      );
      const usersData = await this.fetchUsersUC.execute({
        page,
        limit,
        query,
        filter,
      });

      res.status(httpStatusCode.OK).json({
        message: successMessage.DATA_FETCHED,
        usersData,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
