import { Tutor } from '~entities/Tutor';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { IToggleStatusUseCase } from '~use-case-interfaces/admin/ITutorsUseCase';

/**
 * Use case to toggle a tutor's blocked status.
 * Allows admins to block or unblock tutors.
 */
export class ToggleTutorStatusUseCase implements IToggleStatusUseCase {
  constructor(private _tutorRepo: ITutorRepository) {}

  /**
   * Toggles the 'isBlocked' status of a tutor.
   * @param id The tutor's ID.
   */
  async execute(id: string): Promise<void> {
    const tutor = await this._tutorRepo.findOneById(id);

    if (!tutor) return;

    // Inverse the current blocked status
    const partialTutor: Partial<Tutor> = {
      isBlocked: !tutor.isBlocked,
    };

    // Save changes
    await this._tutorRepo.updateOneById(id, partialTutor);
  }
}
