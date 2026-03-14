import { IForgotPasswordUseCase } from '~use-case-interfaces/shared/IForgotPasswordUseCase';
import { errorMessage } from '~constants/errorMessage';
import { IPendingTutorRepository } from '~repository-interfaces/IPendingTutorRepository';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { IRedisService } from '~service-interfaces/IRedisService';
import { PendingTutor } from '~entities/PendingTutor';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '~errors/HttpError';

export class ForgotPasswordUseCase implements IForgotPasswordUseCase {
  constructor(
    private _tutorRepo: ITutorRepository,
    private _pendingTutorRepo: IPendingTutorRepository,
    private _redisService: IRedisService,
  ) { }

  async execute(email: string): Promise<void> {
    const tutor = await this._tutorRepo.findOneByField({ email });

    if (!tutor) throw new NotFoundError(errorMessage.ACCOUNT_NOT_EXISTS);
    if (tutor.isBlocked) throw new ForbiddenError(errorMessage.BLOCKED);

    const remainingTtl = await this._redisService.getOtpTtl(email);
    const coolDownLimit = 120 - 60; // 120 max TTL, 60 cooldown
    if (remainingTtl > coolDownLimit) {
      throw new BadRequestError('Please wait 60 sec before resend');
    }

    let pendingTutor = await this._pendingTutorRepo.findOneByField({ email });

    if (pendingTutor) {
      await this._pendingTutorRepo.deleteOneByField({ email });
    }

    pendingTutor = new PendingTutor(email, tutor.name);

    await this._pendingTutorRepo.create(pendingTutor);
  }
}
