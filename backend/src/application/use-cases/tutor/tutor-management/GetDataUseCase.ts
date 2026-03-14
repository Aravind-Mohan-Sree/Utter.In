import { TutorMapper, TutorResponseDTO } from '~mappers/TutorMapper';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { IGetDataUseCase } from '~use-case-interfaces/tutor/ITutorUseCase';

export class GetDataUseCase implements IGetDataUseCase {
  constructor(private _tutorRepo: ITutorRepository) {}

  async execute(email: string): Promise<TutorResponseDTO | null> {
    const tutor = await this._tutorRepo.findOneByField({ email });

    if (!tutor) return null;

    return TutorMapper.toResponse(tutor);
  }
}
