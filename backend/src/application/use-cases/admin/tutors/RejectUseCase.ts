import { Tutor } from '~entities/Tutor';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { IMailService } from '~service-interfaces/IMailService';
import { IRejectUseCase } from '~use-case-interfaces/admin/ITutorsUseCase';

export class RejectUseCase implements IRejectUseCase {
  constructor(
    private _tutorRepo: ITutorRepository,
    private _mailService: IMailService,
  ) {}

  async execute(id: string, rejectionReason: string): Promise<string | null> {
    const tutor = await this._tutorRepo.findOneById(id);

    if (!tutor) return null;

    const partialTutor: Partial<Tutor> = {
      rejectionReason,
      expiresAt: new Date(),
    };

    await this._mailService.sendVerificationUpdate(tutor.name, tutor.email);
    await this._tutorRepo.updateOneById(id, partialTutor);

    return tutor.googleId;
  }
}
