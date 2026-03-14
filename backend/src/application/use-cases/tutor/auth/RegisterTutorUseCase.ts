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

export class RegisterTutorUseCase implements IRegisterTutorUseCase {
  constructor(
    private _tutorRepo: ITutorRepository,
    private _pendingTutorRepo: IPendingTutorRepository,
    private _hashService: IHashService,
  ) {}

  async execute(
    data: RegisterTutorDTO,
  ): Promise<{ id: string; email: string }> {
    const tutor = await this._tutorRepo.findOneByField({ email: data.email });

    if (tutor) {
      if (tutor.rejectionReason) {
        throw new BadRequestError(
          `${errorMessage.REJECTED}-${tutor.rejectionReason}/${tutor.email}`,
        );
      }

      throw new ConflictError(errorMessage.ACCOUNT_EXISTS);
    }

    let pendingTutor = await this._pendingTutorRepo.findOneByField({
      email: data.email,
    });

    if (pendingTutor) {
      await this._pendingTutorRepo.deleteOneByField({
        email: pendingTutor.email,
      });
    }

    const hashedPassword = await this._hashService.hash(data.password);

    pendingTutor = new PendingTutor(
      data.email,
      data.name,
      data.knownLanguages,
      data.yearsOfExperience,
      hashedPassword,
    );

    pendingTutor = await this._pendingTutorRepo.create(pendingTutor);

    if (!pendingTutor)
      throw new InternalServerError(errorMessage.SOMETHING_WRONG);

    return { id: pendingTutor.id!, email: pendingTutor.email };
  }
}
