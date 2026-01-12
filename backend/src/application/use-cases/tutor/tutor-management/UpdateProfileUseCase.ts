import { errorMessage } from '~constants/errorMessage';
import { TutorProfileUpdateDTO } from '~dtos/TutorProfileUpdateDTO';
import { Tutor } from '~entities/Tutor';
import { NotFoundError } from '~errors/HttpError';
import { TutorMapper, TutorResponseDTO } from '~mappers/TutorMapper';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { IUpdateProfileUseCase } from '~use-case-interfaces/tutor/ITutorUseCase';

export class UpdateProfileUseCase implements IUpdateProfileUseCase {
  constructor(private tutorRepo: ITutorRepository) {}

  async execute(
    id: string,
    data: TutorProfileUpdateDTO,
  ): Promise<TutorResponseDTO> {
    const partialTutor: Partial<Tutor> = {
      name: data.name,
      bio: data.bio,
      knownLanguages: data.knownLanguages,
      yearsOfExperience: data.yearsOfExperience,
    };
    const updatedTutor = await this.tutorRepo.updateOneById(id, partialTutor);

    if (!updatedTutor) throw new NotFoundError(errorMessage.ACCOUNT_NOT_EXISTS);

    return TutorMapper.toResponse(updatedTutor);
  }
}
