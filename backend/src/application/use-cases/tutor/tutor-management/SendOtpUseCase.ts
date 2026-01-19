import { ISendOtpUseCase } from '~use-case-interfaces/shared/IOtpUseCase';
import { errorMessage } from '~constants/errorMessage';
import { IPendingTutorRepository } from '~repository-interfaces/IPendingTutorRepository';
import { IOtpService } from '~service-interfaces/IOtpService';
import { PendingTutor } from '~entities/PendingTutor';
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '~errors/HttpError';

export class SendOtpUseCase implements ISendOtpUseCase {
  constructor(
    private otpService: IOtpService,
    private pendingTutorRepo: IPendingTutorRepository,
  ) {}

  async execute(id: string): Promise<void> {
    let tutor = await this.pendingTutorRepo.findOneById(id);

    if (!tutor) throw new NotFoundError(errorMessage.OTP_EXPIRED);

    let otp = '';

    if (tutor.otp) {
      const now = new Date().getTime();
      const coolDownMs = 60 * 1000;
      const timeDifferenceMs = now - new Date(tutor.updatedAt!).getTime();

      if (timeDifferenceMs < coolDownMs)
        throw new BadRequestError('Please wait 60 sec before resend');
    }

    otp = this.otpService.createOtp();

    const partialPendingTutor: Partial<PendingTutor> = {
      otp,
    };

    tutor = await this.pendingTutorRepo.updateOneById(id, partialPendingTutor);

    if (!tutor) throw new InternalServerError(errorMessage.SOMETHING_WRONG);

    await this.otpService.sendOtp(tutor.name!, tutor.email, otp);
  }
}
