import { Tutor } from '~entities/Tutor';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { IApproveUseCase } from '~use-case-interfaces/admin/ITutorsUseCase';

export class ApproveUseCase implements IApproveUseCase {
  constructor(private tutorRepo: ITutorRepository) {}

  async execute(id: string, certificationType: string): Promise<void> {
    const tutor = await this.tutorRepo.findOneById(id);

    if (!tutor) return;

    const partialTutor: Partial<Tutor> = {
      isVerified: true,
      certificationType,
    };

    await this.tutorRepo.updateOneById(id, partialTutor);
  }
}
