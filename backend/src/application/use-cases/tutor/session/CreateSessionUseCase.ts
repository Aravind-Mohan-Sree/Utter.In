import { ICreateSessionUseCase } from '~use-case-interfaces/tutor/ISessionUseCase';
import { CreateSessionDTO } from '~dtos/CreateSessionDTO';
import { SessionMapper, SessionResponseDTO } from '~mappers/SessionMapper';
import { ISessionRepository } from '~repository-interfaces/ISessionRepository';
import { Session } from '~entities/Session';

/**
 * Use case to allow tutors to create new available learning sessions.
 */
export class CreateSessionUseCase implements ICreateSessionUseCase {
  constructor(private _sessionRepository: ISessionRepository) { }

  /**
   * Creates a new session record in the database.
   * @param data DTO containing session details like time, language, and price.
   * @returns Mapped session response data.
   */
  async execute(data: CreateSessionDTO): Promise<SessionResponseDTO> {
    // Initialize a new Session entity with 'Available' status
    const sessionEntity = new Session(
      data.tutorId,
      data.scheduledAt,
      data.duration,
      data.language,
      data.topic,
      data.price,
      'Available',
      data.expiresAt, // used for automatic cleanup of unbooked sessions
    );

    // Persist the session to the repository
    const createdSession = await this._sessionRepository.create(sessionEntity);

    return SessionMapper.toResponse(createdSession);
  }
}
