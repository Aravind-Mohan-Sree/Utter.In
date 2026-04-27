import { IRegisterTutorFromPendingUseCase } from '~use-case-interfaces/tutor/ITutorUseCase';
import { TutorMapper, TutorResponseDTO } from '~mappers/TutorMapper';
import { IPendingTutorRepository } from '~repository-interfaces/IPendingTutorRepository';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { Tutor } from '~entities/Tutor';
import { InternalServerError, NotFoundError } from '~errors/HttpError';
import { errorMessage } from '~constants/errorMessage';

/**
 * Use case to convert a pending tutor registration into a permanent tutor record.
 * Similar to FinishRegisterTutor but typically triggered via email verification or direct admin action.
 */
export class RegisterTutorFromPendingUseCase implements IRegisterTutorFromPendingUseCase {
  constructor(
    private _pendingTutorRepo: IPendingTutorRepository,
    private _tutorRepo: ITutorRepository,
  ) {}

  /**
   * Transfers data from the pending queue to the permanent tutor collection.
   * @param email The email address of the tutor to register.
   * @returns IDs of old and new records, plus the mapped tutor data.
   */
  async execute(email: string): Promise<{
    pendingTutorId: string;
    newTutorId: string;
    tutor: TutorResponseDTO;
  }> {
    // Locate the temporary registration data
    const pendingTutor = await this._pendingTutorRepo.findOneByField({ email });

    if (!pendingTutor) throw new NotFoundError('Tutor not found');

    // Build the primary Tutor entity
    const tutor = new Tutor(
      pendingTutor.name!,
      pendingTutor.email,
      pendingTutor.knownLanguages!,
      pendingTutor.yearsOfExperience!,
      'I am a Philologist!', // default bio
      pendingTutor.password!,
      null, // No Google ID for manual registration
      'tutor',
      false, // Verification required
      false, // Block status
      [], // No certifications yet
      null, // No rejection reason
    );

    // Save to the main tutor database
    const newTutor = await this._tutorRepo.create(tutor);

    if (!newTutor) throw new InternalServerError(errorMessage.SOMETHING_WRONG);

    return {
      pendingTutorId: pendingTutor.id!,
      newTutorId: newTutor.id!,
      tutor: TutorMapper.toResponse(newTutor),
    };
  }
}
