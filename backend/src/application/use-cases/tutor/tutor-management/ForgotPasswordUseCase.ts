import { IForgotPasswordUseCase } from '~use-case-interfaces/shared/IForgotPasswordUseCase';
import { errorMessage } from '~constants/errorMessage';
import { IPendingTutorRepository } from '~repository-interfaces/IPendingTutorRepository';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { PendingTutor } from '~entities/PendingTutor';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '~errors/HttpError';

export class ForgotPasswordUseCase implements IForgotPasswordUseCase {
  constructor(
    private tutorRepo: ITutorRepository,
    private pendingTutorRepo: IPendingTutorRepository,
  ) {}

  async execute(email: string): Promise<string> {
    const tutor = await this.tutorRepo.findOneByField({ email });

    if (!tutor) throw new NotFoundError(errorMessage.ACCOUNT_NOT_EXISTS);
    if (tutor.isBlocked) throw new ForbiddenError(errorMessage.BLOCKED);

    let pendingTutor = await this.pendingTutorRepo.findOneByField({ email });

    if (pendingTutor) {
      const now = new Date().getTime();
      const coolDownMs = 60 * 1000;
      const timeDifferenceMs =
        now - new Date(pendingTutor.updatedAt!).getTime();

      if (timeDifferenceMs < coolDownMs)
        throw new BadRequestError('Please wait 60 sec before resend');

      await this.pendingTutorRepo.deleteOneByField({ email });
    }

    pendingTutor = new PendingTutor(email, tutor.name);

    pendingTutor = await this.pendingTutorRepo.create(pendingTutor);

    return pendingTutor.id!;
  }
}
