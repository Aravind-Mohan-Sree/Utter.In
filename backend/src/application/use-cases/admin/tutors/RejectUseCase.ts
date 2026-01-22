import { Tutor } from '~entities/Tutor';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { IMailService } from '~service-interfaces/IMailService';
import { IRejectUseCase } from '~use-case-interfaces/admin/ITutorsUseCase';

export class RejectUseCase implements IRejectUseCase {
  constructor(
    private tutorRepo: ITutorRepository,
    private mailService: IMailService,
  ) {}

  async execute(id: string, rejectionReason: string): Promise<void> {
    const tutor = await this.tutorRepo.findOneById(id);

    if (!tutor) return;

    const partialTutor: Partial<Tutor> = {
      rejectionReason,
      expiresAt: new Date(),
    };

    await this.mailService.sendVerificationUpdate(tutor.name, tutor.email);
    await this.tutorRepo.updateOneById(id, partialTutor);
  }
}
