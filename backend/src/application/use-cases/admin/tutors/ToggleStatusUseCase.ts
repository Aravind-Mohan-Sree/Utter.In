import { Tutor } from '~entities/Tutor';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { IToggleStatusUseCase } from '~use-case-interfaces/admin/ITutorsUseCase';

export class ToggleTutorStatusUseCase implements IToggleStatusUseCase {
  constructor(private tutorRepo: ITutorRepository) {}

  async execute(id: string): Promise<void> {
    const tutor = await this.tutorRepo.findOneById(id);

    if (!tutor) return;

    const partialTutor: Partial<Tutor> = {
      isBlocked: !tutor.isBlocked,
    };

    await this.tutorRepo.updateOneById(id, partialTutor);
  }
}
