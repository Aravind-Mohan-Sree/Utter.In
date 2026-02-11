import { IGetSessionsUseCase } from '~use-case-interfaces/tutor/ISessionUseCase';
import { SessionMapper, SessionResponseDTO } from '~mappers/SessionMapper';
import { ISessionRepository } from '~repository-interfaces/ISessionRepository';

import mongoose from 'mongoose';

export class GetSessionsUseCase implements IGetSessionsUseCase {
  constructor(private sessionRepository: ISessionRepository) { }

  async execute(tutorId: string, date: string): Promise<SessionResponseDTO[]> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const filter = {
      tutorId: new mongoose.Types.ObjectId(tutorId),
      scheduledAt: { $gte: start, $lte: end },
    };

    const sessions = await this.sessionRepository.findAllByField(filter) || [];

    return sessions.map(s => SessionMapper.toResponse(s));
  }
}
