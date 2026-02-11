import { ICancelSessionUseCase } from '~use-case-interfaces/tutor/ISessionUseCase';
import { ISessionRepository } from '~repository-interfaces/ISessionRepository';
import { NotFoundError, ForbiddenError } from '~errors/HttpError';

export class CancelSessionUseCase implements ICancelSessionUseCase {
  constructor(private sessionRepository: ISessionRepository) { }

  async execute(sessionId: string, tutorId: string): Promise<boolean> {
    const session = await this.sessionRepository.findOneById(sessionId);

    if (!session) {
      throw new NotFoundError('Session not found');
    }

    if (session.tutorId !== tutorId) {
      throw new ForbiddenError('You are not authorized to cancel this session');
    }

    await this.sessionRepository.deleteOneById(sessionId);

    return true;
  }
}
