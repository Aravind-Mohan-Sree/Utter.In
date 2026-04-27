import { errorMessage } from '~constants/errorMessage';
import { FinishRegisterTutorDTO } from '~dtos/FinishRegisterTutorDTO';
import { Tutor } from '~entities/Tutor';
import { BadRequestError } from '~errors/HttpError';
import { IPendingTutorRepository } from '~repository-interfaces/IPendingTutorRepository';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { IFinishRegisterTutorUseCase } from '~use-case-interfaces/tutor/ITutorUseCase';

/**
 * Use case to finalize the tutor registration process.
 * Moves data from the pending repository to the primary tutor repository.
 */
export class FinishRegisterTutorUseCase implements IFinishRegisterTutorUseCase {
  constructor(
    private _pendingTutorRepo: IPendingTutorRepository,
    private _tutorRepo: ITutorRepository,
  ) {}

  /**
   * Finalizes registration by creating the permanent tutor record.
   * @param data DTO containing additional registration details (languages, experience).
   * @returns The old pending ID and the new permanent tutor ID.
   */
  async execute(
    data: FinishRegisterTutorDTO,
  ): Promise<{ oldId: string; newId: string }> {
    const { email, knownLanguages, yearsOfExperience } = data;
    
    // Verify that the tutor still exists in the pending registration queue
    const pendingTutor = await this._pendingTutorRepo.findOneByField({ email });

    if (!pendingTutor) throw new BadRequestError(errorMessage.SESSION_EXPIRED);

    // Initialize the permanent Tutor entity with pending data and new inputs
    let tutor = new Tutor(
      pendingTutor.name!,
      pendingTutor.email,
      knownLanguages,
      yearsOfExperience,
      'I am a Philologist!', // default bio
      ' ', // placeholder for profile image if not yet set
      pendingTutor.googleId!,
      'tutor',
      false, // isVerified (requires admin approval)
      false, // isBlocked
      [], // initial certificationType
      null, // rejectionReason
    );

    // Persist the tutor to the primary database
    tutor = await this._tutorRepo.create(tutor);

    return { oldId: pendingTutor.id!, newId: tutor.id! };
  }
}
