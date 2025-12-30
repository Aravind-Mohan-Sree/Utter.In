import { NextFunction, Request, Response } from 'express';
import { httpStatusCode } from '~constants/httpStatusCode';
import { successMessage } from '~constants/successMessage';
import { logger } from '~logger/logger';
import { IGetDataUseCase } from '~use-case-interfaces/user/IUserUseCase';

export class GetDataController {
  constructor(private getData: IGetDataUseCase) {}

  getAccountDetails = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { userEmail } = req.params;
      const user = await this.getData.execute(userEmail);

      res
        .status(httpStatusCode.OK)
        .json({ message: successMessage.DATA_FETCHED, user });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
