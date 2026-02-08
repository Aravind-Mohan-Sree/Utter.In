import { PendingTutor } from '~entities/PendingTutor';
import { IPendingTutorRepository } from '~repository-interfaces/IPendingTutorRepository';
import { ITutorGoogleRegisterUseCase } from '~use-case-interfaces/tutor/ITutorUseCase';

export class TutorGoogleRegisterUseCase implements ITutorGoogleRegisterUseCase {
  constructor(private pendingTutorRepo: IPendingTutorRepository) {}

  async execute(
    name: string,
    email: string,
    googleId: string,
  ): Promise<string> {
    let pendingTutor = await this.pendingTutorRepo.findOneByField({ email });

    if (pendingTutor) {
      await this.pendingTutorRepo.deleteOneByField({
        email: pendingTutor.email,
      });
    }

    const tutor: PendingTutor = {
      name,
      email,
      googleId,
    };

    pendingTutor = await this.pendingTutorRepo.create(tutor);

    return pendingTutor.id!;
  }
}
