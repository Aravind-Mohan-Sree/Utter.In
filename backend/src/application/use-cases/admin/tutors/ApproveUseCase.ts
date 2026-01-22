import { Tutor } from '~entities/Tutor';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { IMailService } from '~service-interfaces/IMailService';
import { IApproveUseCase } from '~use-case-interfaces/admin/ITutorsUseCase';

export class ApproveUseCase implements IApproveUseCase {
  constructor(
    private tutorRepo: ITutorRepository,
    private mailService: IMailService,
  ) {}

  async execute(id: string, certificationType: string): Promise<void> {
    const tutor = await this.tutorRepo.findOneById(id);

    if (!tutor) return;

    const partialTutor: Partial<Tutor> = {
      isVerified: true,
      certificationType,
    };

    await this.mailService.sendWelcome(tutor.name, tutor.email);
    await this.tutorRepo.updateOneById(id, partialTutor);
  }
}
