import { Tutor } from '~entities/Tutor';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { IMailService } from '~service-interfaces/IMailService';
import { IApproveUseCase } from '~use-case-interfaces/admin/ITutorsUseCase';

/**
 * Use case to approve a tutor's account.
 * Sets the tutor as verified and assigns their primary certification type.
 */
export class ApproveUseCase implements IApproveUseCase {
  constructor(
    private _tutorRepo: ITutorRepository,
    private _mailService: IMailService,
  ) {}

  /**
   * Approves a tutor and sends a welcome email.
   * @param id The tutor's ID.
   * @param certificationType The type of certification they are approved for.
   */
  async execute(id: string, certificationType: string): Promise<void> {
    const tutor = await this._tutorRepo.findOneById(id);

    if (!tutor) return;

    // Mark tutor as verified and set their initial certification type
    const partialTutor: Partial<Tutor> = {
      isVerified: true,
      certificationType: [certificationType],
    };

    // Send a welcome email and update the database
    await this._mailService.sendWelcome(tutor.name, tutor.email);
    await this._tutorRepo.updateOneById(id, partialTutor);
  }
}
