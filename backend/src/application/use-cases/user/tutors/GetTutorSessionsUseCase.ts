import { ISessionRepository } from '~repository-interfaces/ISessionRepository';
import { IGetTutorSessionsUseCase } from '~use-case-interfaces/user/ITutorsUseCase';
import { SessionMapper, SessionResponseDTO } from '~mappers/SessionMapper';

import mongoose from 'mongoose';

export class GetTutorSessionsUseCase implements IGetTutorSessionsUseCase {
  constructor(private sessionRepository: ISessionRepository) { }

  async execute(tutorId: string, startDate?: Date, endDate?: Date): Promise<SessionResponseDTO[]> {
    const start = startDate || new Date();

    let end: Date;
    if (startDate && !endDate) {
      end = new Date(startDate);
      end.setHours(23, 59, 59, 999);
    } else {
      end = endDate || new Date(new Date().setDate(start.getDate() + 30));
    }

    const filter = {
      tutorId: new mongoose.Types.ObjectId(tutorId),
      scheduledAt: { $gte: start, $lte: end },
    };

    const sessions = await this.sessionRepository.findAllByField(filter) || [];

    const availableSessions = sessions
      .filter(session => session.status === 'Available')
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

    return availableSessions.map(SessionMapper.toResponse);
  }
}
