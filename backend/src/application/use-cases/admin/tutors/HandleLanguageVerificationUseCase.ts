import { Tutor } from '~entities/Tutor';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { IMailService } from '~service-interfaces/IMailService';
import { IHandleLanguageVerificationUseCase } from '~use-case-interfaces/admin/ITutorsUseCase';
import { NotFoundError } from '~errors/HttpError';
import { errorMessage } from '~constants/errorMessage';
import { IDeleteFileUseCase } from '~use-case-interfaces/shared/IFileUseCase';
import { contentTypes, filePrefixes } from '~constants/fileConstants';

/**
 * Use case to handle the verification of languages for a tutor.
 * Admins can approve or reject pending language certifications.
 */
export class HandleLanguageVerificationUseCase implements IHandleLanguageVerificationUseCase {
  constructor(
    private _tutorRepo: ITutorRepository,
    private _mailService: IMailService,
    private _deleteFileUseCase: IDeleteFileUseCase,
  ) {}

  /**
   * Executes the language verification process.
   * @param id The tutor's unique identifier.
   * @param action Whether to approve or reject the certification.
   * @param data Optional data containing certification type or rejection reason.
   */
  async execute(
    id: string,
    action: 'approve' | 'reject',
    data: { certificationType?: string; rejectionReason?: string },
  ): Promise<void> {
    const tutor = await this._tutorRepo.findOneById(id);

    if (!tutor) throw new NotFoundError(errorMessage.ACCOUNT_NOT_EXISTS);

    const partialTutor: Partial<Tutor> = {
      languageVerificationStatus:
        action === 'approve' ? 'approved' : 'rejected',
    };

    if (action === 'approve') {
      // Merge pending languages into known languages
      const updatedLanguages = [
        ...tutor.knownLanguages,
        ...tutor.pendingLanguages,
      ];

      // Add pending certification to the certificates array
      const updatedCertificates = [...tutor.certificates];
      if (tutor.pendingCertification) {
        updatedCertificates.push(tutor.pendingCertification);
      }

      // Add the new certification type to the certificationType array
      const updatedCertificationTypes = [...tutor.certificationType];
      if (data.certificationType && !updatedCertificationTypes.includes(data.certificationType)) {
        updatedCertificationTypes.push(data.certificationType);
      }

      // Update tutor with new data and clear pending state
      partialTutor.knownLanguages = updatedLanguages;
      partialTutor.certificates = updatedCertificates;
      partialTutor.certificationType = updatedCertificationTypes;
      partialTutor.pendingLanguages = [];
      partialTutor.pendingCertification = null;
      partialTutor.languageVerificationStatus = null;

      // Notify tutor of approval via email
      await this._mailService.sendLanguageVerificationUpdate(
        tutor.name,
        tutor.email,
        'approved',
      );
    } else {
      // If rejected, just delete the pending certificate file from storage
      const pendingCertUrl = tutor.pendingCertification;

      partialTutor.pendingLanguages = [];
      partialTutor.pendingCertification = null;
      partialTutor.languageVerificationStatus = null;

      if (pendingCertUrl) {
        const filename = this._getFilenameFromUrl(pendingCertUrl);
        if (filename) {
          await this._deleteFileUseCase.execute(
            filePrefixes.TUTOR_CERTIFICATE,
            filename,
            contentTypes.APPLICATION_PDF,
          );
        }
      }

      const cleanedReason = data.rejectionReason?.includes('/')
        ? data.rejectionReason.split('/')[1]
        : data.rejectionReason;

      // Notify tutor of rejection via email
      await this._mailService.sendLanguageVerificationUpdate(
        tutor.name,
        tutor.email,
        'rejected',
        undefined,
        cleanedReason,
      );
    }

    // Save changes to the database
    await this._tutorRepo.updateOneById(id, partialTutor);
  }

  /**
   * Helper method to extract the filename from an AWS S3 URL.
   * @param url The full URL of the file.
   * @returns The extracted filename or null if parsing fails.
   */
  private _getFilenameFromUrl(url: string): string | null {
    try {
      const key = url.split('.amazonaws.com/')[1];
      const filenameWithExt = key.split('/').pop();
      if (!filenameWithExt) return null;
      return filenameWithExt.split('.')[0];
    } catch {
      return null;
    }
  }
}
