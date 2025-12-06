import { NextFunction, Request, Response } from 'express';
import { RegisterUserDTO } from '~/application/dtos/RegisterUserDTO';
import { ISendOtpUseCase } from '~application-interfaces/use-cases/IOtpUseCase';
import { IRegisterUserUseCase } from '~application-interfaces/use-cases/IUserUseCase';
import { httpStatusCode } from '~constants/httpStatusCode';
import { IValidateDataService } from '~domain-services/IValidateDataService';
import { logger } from '~logger/logger';

export class AuthController {
  constructor(
    private registerUser: IRegisterUserUseCase,
    private validator: IValidateDataService,
    private sendOtp: ISendOtpUseCase,
  ) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = new RegisterUserDTO(req.body, this.validator);

      const email = await this.registerUser.execute(data);

      await this.sendOtp.execute(email);

      res.status(httpStatusCode.CREATED).json({status: true, message: 'OTP sended'});
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
