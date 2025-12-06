import { NextFunction, Request, Response } from 'express';
import { IVerifyOtpUseCase } from '~application-interfaces/use-cases/IOtpUseCase';
import { IRegisterUserFromPendingUseCase } from '~application-interfaces/use-cases/IUserUseCase';
import { httpStatusCode } from '~constants/httpStatusCode';
import { logger } from '~logger/logger';

export class VerifyOtpController {
  constructor(
    private verifyOtp: IVerifyOtpUseCase,
    private registerUserFromPending: IRegisterUserFromPendingUseCase,
  ) {}

  verify = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { otp, email } = req.body;

      await this.verifyOtp.execute(email, otp);

      const user = await this.registerUserFromPending.execute(email);

      res
        .status(httpStatusCode.OK)
        .json({ status: true, message: 'Signup successful', user });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
