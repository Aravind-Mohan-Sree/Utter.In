import { IGetSessionsUseCase } from '~use-case-interfaces/tutor/ISessionUseCase';
import { SessionMapper, SessionResponseDTO } from '~mappers/SessionMapper';
import { ISessionRepository } from '~repository-interfaces/ISessionRepository';

import mongoose from 'mongoose';

/**
 * Use case to retrieve all sessions created by a tutor for a specific date.
 */
export class GetSessionsUseCase implements IGetSessionsUseCase {
  constructor(private _sessionRepository: ISessionRepository) { }

  /**
   * Fetches sessions within a 24-hour range for a given date.
   * @param tutorId The tutor's ID.
   * @param date The specific date string to filter by.
   * @returns Array of mapped session response DTOs.
   */
  async execute(tutorId: string, date: string): Promise<SessionResponseDTO[]> {
    // Define the 24-hour time range for the requested date
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const filter = {
      tutorId: new mongoose.Types.ObjectId(tutorId),
      scheduledAt: { $gte: start, $lte: end },
    };

    // Query the repository for sessions matching the tutor and time range
    const sessions = await this._sessionRepository.findAllByField(filter) || [];

    // Map entities to response objects
    return sessions.map(s => SessionMapper.toResponse(s));
  }
}
