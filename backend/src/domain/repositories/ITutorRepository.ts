import { Tutor } from '~entities/Tutor';
import { IBaseRepository } from './IBaseRepository';
import { ITutor } from '~models/TutorModel';

export interface ITutorRepository extends IBaseRepository<Tutor, ITutor> {
  
}
