import { Session } from '~entities/Session';
import { IBaseRepository } from './IBaseRepository';
import { ISession } from '~models/SessionModel';

export interface ISessionRepository extends IBaseRepository<Session, ISession> { }
