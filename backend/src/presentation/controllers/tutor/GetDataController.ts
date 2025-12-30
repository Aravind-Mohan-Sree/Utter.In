import { NextFunction, Request, Response } from 'express';
import { httpStatusCode } from '~constants/httpStatusCode';
import { successMessage } from '~constants/successMessage';
import { logger } from '~logger/logger';
import { IGetDataUseCase } from '~use-case-interfaces/tutor/ITutorUseCase';

export class GetDataController {
  constructor(private getData: IGetDataUseCase) {}

  getAccountDetails = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { tutorEmail } = req.params;
      const tutor = await this.getData.execute(tutorEmail);

      res
        .status(httpStatusCode.OK)
        .json({ message: successMessage.DATA_FETCHED, tutor });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
