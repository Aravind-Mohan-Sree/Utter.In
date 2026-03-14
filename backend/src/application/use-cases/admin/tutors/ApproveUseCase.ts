import { Tutor } from '~entities/Tutor';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { IMailService } from '~service-interfaces/IMailService';
import { IApproveUseCase } from '~use-case-interfaces/admin/ITutorsUseCase';

export class ApproveUseCase implements IApproveUseCase {
  constructor(
    private _tutorRepo: ITutorRepository,
    private _mailService: IMailService,
  ) {}

  async execute(id: string, certificationType: string): Promise<void> {
    const tutor = await this._tutorRepo.findOneById(id);

    if (!tutor) return;

    const partialTutor: Partial<Tutor> = {
      isVerified: true,
      certificationType,
    };

    await this._mailService.sendWelcome(tutor.name, tutor.email);
    await this._tutorRepo.updateOneById(id, partialTutor);
  }
}
