import { CreateSessionDTO } from '~dtos/CreateSessionDTO';
import { SessionResponseDTO } from '~mappers/SessionMapper';

export interface ICreateSessionUseCase {
    execute(data: CreateSessionDTO): Promise<SessionResponseDTO>;
}

export interface IGetSessionsUseCase {
    execute(tutorId: string, date: string): Promise<SessionResponseDTO[]>;
}

export interface ICancelSessionUseCase {
    execute(sessionId: string, tutorId: string): Promise<boolean>;
}
