import { errorMessage } from '~constants/errorMessage';
import { FinishRegisterTutorDTO } from '~dtos/FinishRegisterTutorDTO';
import { Tutor } from '~entities/Tutor';
import { BadRequestError } from '~errors/HttpError';
import { IPendingTutorRepository } from '~repository-interfaces/IPendingTutorRepository';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { IFinishRegisterTutorUseCase } from '~use-case-interfaces/tutor/ITutorUseCase';
import {
  IUpdateFileUseCase,
  IUploadFileUseCase,
} from '~use-case-interfaces/shared/IFileUseCase';
import { contentTypes, filePrefixes } from '~constants/fileConstants';
import { env } from '~config/env';

/**
 * Use case to finalize the tutor registration process.
 * Moves data from the pending repository to the primary tutor repository.
 */
export class FinishRegisterTutorUseCase implements IFinishRegisterTutorUseCase {
  constructor(
    private _pendingTutorRepo: IPendingTutorRepository,
    private _tutorRepo: ITutorRepository,
    private _updateFile: IUpdateFileUseCase,
    private _uploadFile: IUploadFileUseCase,
  ) {}

  /**
   * Finalizes registration by creating the permanent tutor record.
   * @param data DTO containing additional registration details (languages, experience).
   * @returns The old pending ID and the new permanent tutor ID.
   */
  async execute(
    data: FinishRegisterTutorDTO,
  ): Promise<{ oldId: string; newId: string }> {
    const { email, knownLanguages, yearsOfExperience, introVideo, certificate } =
      data;

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
      false, // isBlocked
      false, // isVerified
      [], // initial certificationType
      null, // rejectionReason
    );

    // Persist the tutor to the primary database
    tutor = await this._tutorRepo.create(tutor);

    const oldId = pendingTutor.id!;
    const newId = tutor.id!;

    // Move temporary avatar to permanent location
    await this._updateFile.execute(
      filePrefixes.TEMP_TUTOR_AVATAR,
      filePrefixes.TUTOR_AVATAR,
      oldId,
      newId,
      contentTypes.IMAGE_JPEG,
    );

    // Upload final video and certificate
    await this._uploadFile.execute(
      filePrefixes.TUTOR_VIDEO,
      newId,
      introVideo.path!,
      contentTypes.VIDEO_MP4,
    );
    await this._uploadFile.execute(
      filePrefixes.TUTOR_CERTIFICATE,
      `${newId}_1`,
      certificate.path!,
      contentTypes.APPLICATION_PDF,
    );

    // Update the tutor record with the generated certificate URL
    const certUrl = `https://${env.AWS_BUCKET}.s3.amazonaws.com/${filePrefixes.TUTOR_CERTIFICATE}${newId}_1.pdf`;
    await this._tutorRepo.updateOneById(newId, {
      certificates: [certUrl],
    });

    return { oldId, newId };
  }
}
