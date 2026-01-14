import { Tutor } from '~entities/Tutor';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { IRejectUseCase } from '~use-case-interfaces/admin/ITutorsUseCase';

export class RejectUseCase implements IRejectUseCase {
  constructor(private tutorRepo: ITutorRepository) {}

  async execute(id: string, rejectionReason: string): Promise<void> {
    const tutor = await this.tutorRepo.findOneById(id);

    if (!tutor) return;

    const partialTutor: Partial<Tutor> = {
      rejectionReason,
      expiresAt: new Date(),
    };

    await this.tutorRepo.updateOneById(id, partialTutor);
  }
}
