import { env } from '~config/env';
import { errorMessage } from '~constants/errorMessage';
import { filePrefixes, contentTypes } from '~constants/fileConstants';
import { TutorProfileUpdateDTO } from '~dtos/TutorProfileUpdateDTO';
import { Tutor } from '~entities/Tutor';
import { BadRequestError, NotFoundError } from '~errors/HttpError';
import { TutorMapper, TutorResponseDTO } from '~mappers/TutorMapper';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { IMailService } from '~service-interfaces/IMailService';
import { IUpdateProfileUseCase } from '~use-case-interfaces/tutor/ITutorUseCase';
import { IUploadFileUseCase } from '~use-case-interfaces/shared/IFileUseCase';

/**
 * Use case to handle tutor profile updates.
 * Manages basic profile data, language changes, and certificate uploads for verification.
 */
export class UpdateProfileUseCase implements IUpdateProfileUseCase {
  constructor(
    private _tutorRepo: ITutorRepository,
    private _uploadFileUseCase: IUploadFileUseCase,
    private _mailService: IMailService,
  ) {}

  /**
   * Updates tutor profile details. If new languages are added, triggers a verification flow.
   * @param id The tutor's unique ID.
   * @param data DTO containing updated profile fields and optional certificate.
   * @returns Mapped tutor response data.
   */
  async execute(
    id: string,
    data: TutorProfileUpdateDTO,
  ): Promise<TutorResponseDTO> {
    const existingTutor = await this._tutorRepo.findOneById(id);
    if (!existingTutor)
      throw new NotFoundError(errorMessage.ACCOUNT_NOT_EXISTS);

    // Identify if any new languages were added that aren't already in the tutor's list
    const newLanguages = data.knownLanguages.filter(
      (lang) => !existingTutor.knownLanguages.includes(lang),
    );

    const partialTutor: Partial<Tutor> = {
      name: data.name,
      bio: data.bio,
      yearsOfExperience: data.yearsOfExperience,
    };

    // Flow for adding new languages (requires certificate and admin verification)
    if (newLanguages.length > 0) {
      // Prevent multiple concurrent verification requests
      if (existingTutor.languageVerificationStatus === 'pending') {
        throw new BadRequestError(
          'Further language edits are locked until current verification is complete.',
        );
      }

      if (!data.certificate) {
        throw new BadRequestError(
          'A certificate is required when adding new languages.',
        );
      }

      // Handle certificate versioning to prevent overwriting old files
      let version = 1;
      const currentCert =
        existingTutor.pendingCertification ||
        (existingTutor.certificates.length > 0
          ? existingTutor.certificates[existingTutor.certificates.length - 1]
          : null);
      if (currentCert) {
        const match = currentCert.match(/_(\d+)\.pdf$/);
        if (match) {
          version = parseInt(match[1]) + 1;
        }
      }

      const filename = `${id}_${version}`;
      
      // Upload the certificate to cloud storage
      await this._uploadFileUseCase.execute(
        filePrefixes.TUTOR_CERTIFICATE,
        filename,
        data.certificate.path,
        contentTypes.APPLICATION_PDF,
      );

      const certificateUrl = `https://${env.AWS_BUCKET}.s3.amazonaws.com/${filePrefixes.TUTOR_CERTIFICATE}${filename}.pdf`;

      // Set verification-related fields
      partialTutor.pendingLanguages = newLanguages;
      partialTutor.pendingCertification = certificateUrl;
      partialTutor.languageVerificationStatus = 'pending';

      // Notify the tutor that the verification process has started
      await this._mailService.sendLanguageVerificationUpdate(
        existingTutor.name,
        existingTutor.email,
        'started',
        newLanguages,
      );
    } else {
      // If no new languages were added (just reordering or deleting), update the list directly
      partialTutor.knownLanguages = data.knownLanguages;
    }

    // Save profile changes
    const updatedTutor = await this._tutorRepo.updateOneById(id, partialTutor);

    if (!updatedTutor) throw new NotFoundError(errorMessage.ACCOUNT_NOT_EXISTS);

    return TutorMapper.toResponse(updatedTutor);
  }
}
