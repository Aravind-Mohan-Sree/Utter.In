import { Tutor } from '~entities/Tutor';
import { IBaseRepository } from './IBaseRepository';
import { ITutor } from '~models/TutorModel';

export interface ITutorRepository extends IBaseRepository<Tutor, ITutor> {
  fetchTutors(
    page: number,
    limit: number,
    query: string,
    filter: string,
  ): Promise<{
    totalTutorsCount: number;
    filteredTutorsCount: number;
    tutors: Tutor[];
  }>;
}
