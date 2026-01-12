import { errorMessage } from '~constants/errorMessage';
import { NotFoundError } from '~errors/HttpError';
import { TutorMapper, TutorResponseDTO } from '~mappers/TutorMapper';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { IGetDataUseCase } from '~use-case-interfaces/tutor/ITutorUseCase';

export class GetDataUseCase implements IGetDataUseCase {
  constructor(private tutorRepo: ITutorRepository) {}

  async execute(email: string): Promise<TutorResponseDTO> {
    const tutor = await this.tutorRepo.findOneByField({ email });

    if (!tutor) throw new NotFoundError(errorMessage.SOMETHING_WRONG);

    return TutorMapper.toResponse(tutor);
  }
}
