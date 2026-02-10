import { ICreateSessionUseCase } from '~use-case-interfaces/tutor/ISessionUseCase';
import { CreateSessionDTO } from '~dtos/CreateSessionDTO';
import { SessionMapper, SessionResponseDTO } from '~mappers/SessionMapper';
import { ISessionRepository } from '~repository-interfaces/ISessionRepository';
import { Session } from '~entities/Session';

export class CreateSessionUseCase implements ICreateSessionUseCase {
    constructor(private sessionRepository: ISessionRepository) { }

    async execute(data: CreateSessionDTO): Promise<SessionResponseDTO> {
        const sessionEntity = new Session(
            data.tutorId,
            data.scheduledAt,
            data.duration,
            data.language,
            data.topic,
            data.price,
            'Available',
            data.expiresAt
        );

        const createdSession = await this.sessionRepository.create(sessionEntity);

        return SessionMapper.toResponse(createdSession);
    }
}
