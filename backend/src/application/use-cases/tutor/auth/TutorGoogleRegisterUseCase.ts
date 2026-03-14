import { PendingTutor } from '~entities/PendingTutor';
import { IPendingTutorRepository } from '~repository-interfaces/IPendingTutorRepository';
import { ITutorGoogleRegisterUseCase } from '~use-case-interfaces/tutor/ITutorUseCase';

export class TutorGoogleRegisterUseCase implements ITutorGoogleRegisterUseCase {
  constructor(private _pendingTutorRepo: IPendingTutorRepository) {}

  async execute(
    name: string,
    email: string,
    googleId: string,
  ): Promise<string> {
    let pendingTutor = await this._pendingTutorRepo.findOneByField({ email });

    if (pendingTutor) {
      await this._pendingTutorRepo.deleteOneByField({
        email: pendingTutor.email,
      });
    }

    const tutor: PendingTutor = {
      name,
      email,
      googleId,
    };

    pendingTutor = await this._pendingTutorRepo.create(tutor);

    return pendingTutor.id!;
  }
}
