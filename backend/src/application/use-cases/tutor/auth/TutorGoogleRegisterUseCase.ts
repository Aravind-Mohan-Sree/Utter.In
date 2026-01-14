import { PendingTutor } from '~entities/PendingTutor';
import { IPendingTutorRepository } from '~repository-interfaces/IPendingTutorRepository';
import { ITutorGoogleRegisterUseCase } from '~use-case-interfaces/tutor/ITutorUseCase';

export class TutorGoogleRegisterUseCase implements ITutorGoogleRegisterUseCase {
  constructor(private pendingTutorRepo: IPendingTutorRepository) {}

  async execute(
    name: string,
    email: string,
  ): Promise<void> {
    const pendingTutor = new PendingTutor(email, name);

    await this.pendingTutorRepo.create();
  }
}
