import { RegisterTutorDTO } from '~dtos/RegisterTutorDTO';
import { IRegisterTutorUseCase } from '~use-case-interfaces/tutor/ITutorUseCase';
import { errorMessage } from '~constants/errorMessage';
import { IPendingTutorRepository } from '~repository-interfaces/IPendingTutorRepository';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { IHashService } from '~service-interfaces/IHashService';
import { PendingTutor } from '~entities/PendingTutor';
import { ConflictError, InternalServerError } from '~errors/HttpError';

export class RegisterTutorUseCase implements IRegisterTutorUseCase {
  constructor(
    private tutorRepo: ITutorRepository,
    private pendingTutorRepo: IPendingTutorRepository,
    private hashService: IHashService,
  ) {}

  async execute(
    data: RegisterTutorDTO,
  ): Promise<{ id: string; email: string }> {
    const tutor = await this.tutorRepo.findOneByField({ email: data.email });

    parent: if (tutor) {
      if (tutor.rejectionReason) {
        await this.tutorRepo.deleteOneById(tutor.id!);

        break parent;
      }

      throw new ConflictError(errorMessage.ACCOUNT_EXISTS);
    }

    let pendingTutor = await this.pendingTutorRepo.findOneByField({
      email: data.email,
    });

    if (pendingTutor) {
      await this.pendingTutorRepo.deleteOneByField({
        email: pendingTutor.email,
      });
    }

    const hashedPassword = await this.hashService.hash(data.password);

    pendingTutor = new PendingTutor(
      data.email,
      data.name,
      data.knownLanguages,
      data.yearsOfExperience,
      hashedPassword,
    );

    pendingTutor = await this.pendingTutorRepo.create(pendingTutor);

    if (!pendingTutor)
      throw new InternalServerError(errorMessage.SOMETHING_WRONG);

    return { id: pendingTutor.id!, email: pendingTutor.email };
  }
}
