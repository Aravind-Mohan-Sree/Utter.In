import { PendingTutor } from '~entities/PendingTutor';
import { IBaseRepository } from './IBaseRepository';
import { IPendingTutor } from '~models/PendingTutorModel';

export interface IPendingTutorRepository extends IBaseRepository<
  PendingTutor,
  IPendingTutor
> {}
