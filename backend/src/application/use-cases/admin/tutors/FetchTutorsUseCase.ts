import { TutorMapper, TutorResponseDTO } from '~mappers/TutorMapper';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { IFetchTutorsUseCase } from '~use-case-interfaces/admin/ITutorsUseCase';

/**
 * Use case to fetch tutors for the admin dashboard.
 * Supports pagination, search queries, and filtering.
 */
export class FetchTutorsUseCase implements IFetchTutorsUseCase {
  constructor(private _tutorRepo: ITutorRepository) { }

  /**
   * Retrieves a paginated and filtered list of tutors.
   * @param data Object containing page, limit, search query, and filter criteria.
   * @returns Counts and mapped tutor data.
   */
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
    // Fetch data from repository with admin privileges (include extra fields)
    const { totalTutorsCount, filteredTutorsCount, tutors } =
      await this._tutorRepo.fetchTutors(
        data.page,
        data.limit,
        data.query,
        data.filter,
        undefined,
        undefined,
        true, // isAdmin flag to include sensitive/pending data
      );

    // Map entities to response DTOs
    const fetchedTutors = tutors.map(TutorMapper.toResponse);

    return { totalTutorsCount, filteredTutorsCount, tutors: fetchedTutors };
  }
}
