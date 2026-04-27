import { RegisterTutorDTO } from '~dtos/RegisterTutorDTO';
import { IRegisterTutorUseCase } from '~use-case-interfaces/tutor/ITutorUseCase';
import { errorMessage } from '~constants/errorMessage';
import { IPendingTutorRepository } from '~repository-interfaces/IPendingTutorRepository';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { IHashService } from '~service-interfaces/IHashService';
import { PendingTutor } from '~entities/PendingTutor';
import {
  BadRequestError,
  ConflictError,
  InternalServerError,
} from '~errors/HttpError';

/**
 * Use case to initiate tutor registration.
 * Checks for existing accounts and creates a pending tutor record for verification.
 */
export class RegisterTutorUseCase implements IRegisterTutorUseCase {
  constructor(
    private _tutorRepo: ITutorRepository,
    private _pendingTutorRepo: IPendingTutorRepository,
    private _hashService: IHashService,
  ) {}

  /**
   * Registers a tutor in the pending queue.
   * @param data DTO containing registration details.
   * @returns The ID and email of the pending tutor.
   */
  async execute(
    data: RegisterTutorDTO,
  ): Promise<{ id: string; email: string }> {
    // Prevent duplicate registration if a tutor already exists with this email
    const tutor = await this._tutorRepo.findOneByField({ email: data.email });

    if (tutor) {
      // Special case: if they were rejected, we provide the reason instead of a generic "exists" error
      if (tutor.rejectionReason) {
        throw new BadRequestError(
          `${errorMessage.REJECTED}-${tutor.rejectionReason}/${tutor.email}`,
        );
      }

      throw new ConflictError(errorMessage.ACCOUNT_EXISTS);
    }

    // Clean up any stale pending registration for this email
    let pendingTutor = await this._pendingTutorRepo.findOneByField({
      email: data.email,
    });

    if (pendingTutor) {
      await this._pendingTutorRepo.deleteOneByField({
        email: pendingTutor.email,
      });
    }

    // Hash password for security
    const hashedPassword = await this._hashService.hash(data.password);

    // Create a new pending tutor entity
    pendingTutor = new PendingTutor(
      data.email,
      data.name,
      data.knownLanguages,
      data.yearsOfExperience,
      hashedPassword,
    );

    // Persist to the pending collection (usually expires after verification or a timeout)
    pendingTutor = await this._pendingTutorRepo.create(pendingTutor);

    if (!pendingTutor)
      throw new InternalServerError(errorMessage.SOMETHING_WRONG);

    return { id: pendingTutor.id!, email: pendingTutor.email };
  }
}
