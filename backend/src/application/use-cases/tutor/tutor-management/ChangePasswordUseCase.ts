import { errorMessage } from '~constants/errorMessage';
import { ChangePasswordDTO } from '~dtos/ChangePasswordDTO';
import { Tutor } from '~entities/Tutor';
import { BadRequestError, NotFoundError } from '~errors/HttpError';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { IHashService } from '~service-interfaces/IHashService';
import { IChangePasswordUseCase } from '~use-case-interfaces/tutor/ITutorUseCase';

export class ChangePasswordUseCase implements IChangePasswordUseCase {
  constructor(
    private tutorRepo: ITutorRepository,
    private hashService: IHashService,
  ) {}

  async execute(id: string, data: ChangePasswordDTO): Promise<void> {
    const tutor = await this.tutorRepo.findOneById(id);

    if (!tutor) throw new NotFoundError(errorMessage.ACCOUNT_NOT_EXISTS);

    const validPassword = await this.hashService.compare(
      data.currentPassword,
      tutor.password,
    );

    if (!validPassword) throw new BadRequestError(errorMessage.WRONG_PASSWORD);

    const partialTutor: Partial<Tutor> = {
      password: await this.hashService.hash(data.password),
    };

    await this.tutorRepo.updateOneById(id, partialTutor);
  }
}
