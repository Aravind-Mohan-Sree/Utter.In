import { Tutor } from '~entities/Tutor';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { IToggleStatusUseCase } from '~use-case-interfaces/admin/ITutorsUseCase';

export class ToggleTutorStatusUseCase implements IToggleStatusUseCase {
  constructor(private _tutorRepo: ITutorRepository) {}

  async execute(id: string): Promise<void> {
    const tutor = await this._tutorRepo.findOneById(id);

    if (!tutor) return;

    const partialTutor: Partial<Tutor> = {
      isBlocked: !tutor.isBlocked,
    };

    await this._tutorRepo.updateOneById(id, partialTutor);
  }
}
