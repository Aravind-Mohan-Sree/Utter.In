import { ISendOtpUseCase } from '~use-case-interfaces/shared/IOtpUseCase';
import { errorMessage } from '~constants/errorMessage';
import { IPendingTutorRepository } from '~repository-interfaces/IPendingTutorRepository';
import { IMailService } from '~service-interfaces/IMailService';
import { PendingTutor } from '~entities/PendingTutor';
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '~errors/HttpError';

export class SendOtpUseCase implements ISendOtpUseCase {
  constructor(
    private mailService: IMailService,
    private pendingTutorRepo: IPendingTutorRepository,
  ) {}

  async execute(email: string): Promise<void> {
    let tutor = await this.pendingTutorRepo.findOneByField({ email });

    if (!tutor) throw new NotFoundError(errorMessage.OTP_EXPIRED);

    let otp = '';

    if (tutor.otp) {
      const now = new Date().getTime();
      const coolDownMs = 60 * 1000;
      const timeDifferenceMs = now - new Date(tutor.updatedAt!).getTime();

      if (timeDifferenceMs < coolDownMs)
        throw new BadRequestError('Please wait 60 sec before resend');
    }

    otp = this.mailService.generateOtp();

    const partialPendingTutor: Partial<PendingTutor> = {
      otp,
    };

    tutor = await this.pendingTutorRepo.updateOneByField(
      { email },
      partialPendingTutor,
    );

    if (!tutor) throw new InternalServerError(errorMessage.SOMETHING_WRONG);

    await this.mailService.sendOtp(tutor.name!, tutor.email, otp);
  }
}
