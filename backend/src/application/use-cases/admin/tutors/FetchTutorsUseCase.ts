import { TutorMapper, TutorResponseDTO } from '~mappers/TutorMapper';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { IFetchTutorsUseCase } from '~use-case-interfaces/admin/ITutorsUseCase';

export class FetchTutorsUseCase implements IFetchTutorsUseCase {
  constructor(private tutorRepo: ITutorRepository) { }

  async execute(data: {
    page: number;
    limit: number;
    query: string;
    filter: string;
  }): Promise<{
    totalTutorsCount: number;
    filteredTutorsCount: number;
    tutors: TutorResponseDTO[];
  }> {
    const { totalTutorsCount, filteredTutorsCount, tutors } =
      await this.tutorRepo.fetchTutors(
        data.page,
        data.limit,
        data.query,
        data.filter,
        undefined,
        undefined,
        true,
      );

    const fetchedTutors = tutors.map(TutorMapper.toResponse);

    return { totalTutorsCount, filteredTutorsCount, tutors: fetchedTutors };
  }
}
