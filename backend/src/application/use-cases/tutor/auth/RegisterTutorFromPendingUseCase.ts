import { IRegisterTutorFromPendingUseCase } from '~use-case-interfaces/tutor/ITutorUseCase';
import { TutorMapper, TutorResponseDTO } from '~mappers/TutorMapper';
import { IPendingTutorRepository } from '~repository-interfaces/IPendingTutorRepository';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { Tutor } from '~entities/Tutor';
import { InternalServerError, NotFoundError } from '~errors/HttpError';
import { errorMessage } from '~constants/errorMessage';
import { IUpdateFileUseCase } from '~use-case-interfaces/shared/IFileUseCase';
import { contentTypes, filePrefixes } from '~constants/fileConstants';
import { env } from '~config/env';

/**
 * Use case to convert a pending tutor registration into a permanent tutor record.
 * Similar to FinishRegisterTutor but typically triggered via email verification or direct admin action.
 */
export class RegisterTutorFromPendingUseCase
implements IRegisterTutorFromPendingUseCase
{
  constructor(
    private _pendingTutorRepo: IPendingTutorRepository,
    private _tutorRepo: ITutorRepository,
    private _updateFile: IUpdateFileUseCase,
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
      false, // Block status
      false, // Verification required
      [], // No certifications yet
      null, // No rejection reason
    );

    // Save to the main tutor database
    const newTutor = await this._tutorRepo.create(tutor);

    if (!newTutor) throw new InternalServerError(errorMessage.SOMETHING_WRONG);

    const pendingTutorId = pendingTutor.id!;
    const newTutorId = newTutor.id!;

    await this._updateFile.execute(
      filePrefixes.TEMP_TUTOR_VIDEO,
      filePrefixes.TUTOR_VIDEO,
      pendingTutorId,
      newTutorId,
      contentTypes.VIDEO_MP4,
    );
    await this._updateFile.execute(
      filePrefixes.TEMP_TUTOR_CERTIFICATE,
      filePrefixes.TUTOR_CERTIFICATE,
      `${pendingTutorId}_1`,
      `${newTutorId}_1`,
      contentTypes.APPLICATION_PDF,
    );

    // Update tutor with certificates array
    const certUrl = `https://${env.AWS_BUCKET}.s3.amazonaws.com/${filePrefixes.TUTOR_CERTIFICATE}${newTutorId}_1.pdf`;
    const updatedTutor = await this._tutorRepo.updateOneById(newTutorId, {
      certificates: [certUrl],
    });

    return {
      pendingTutorId,
      newTutorId,
      tutor: TutorMapper.toResponse(updatedTutor!),
    };
  }
}
