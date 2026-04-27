import { IAbuseReportRepository } from '~repository-interfaces/IAbuseReportRepository';
import { IGetUserAbuseReportsUseCase } from '../../../use-case-interfaces/shared/IAbuseReportUseCase';

import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';

/**
 * Use case to retrieve abuse reports submitted by a specific user.
 * Allows users to track the status of their submitted reports.
 */
export class GetUserAbuseReportsUseCase implements IGetUserAbuseReportsUseCase {
  constructor(
    private _abuseReportRepository: IAbuseReportRepository,
    private _userRepository: IUserRepository,
    private _tutorRepository: ITutorRepository,
  ) { }

  /**
   * Fetches reports submitted by a user with details about the reported party.
   * @param userId The ID of the reporter.
   * @param page Current page.
   * @param limit Records per page.
   * @param status Optional status filter.
   * @returns List of enriched report objects.
   */
  async execute(userId: string, page: number, limit: number, status?: string): Promise<{
    reports: {
      id: string;
      status: 'Pending' | 'Resolved' | 'Rejected';
      type: string;
      reportedUser: { id: string; name: string; email: string };
      date: string;
      description: string;
      channel: 'video' | 'chat';
    }[];
    total: number;
  }> {
    // Fetch raw reports from repository based on the reporter's ID
    const result = await this._abuseReportRepository.findByReporter(userId, page, limit, status);

    // Enrich report data with basic details of the person who was reported
    const reportsWithDetails = await Promise.all(
      result.reports.map(async (report) => {
        const [reportedUser, reportedTutor] = await Promise.all([
          this._userRepository.findOneById(report.reportedId),
          this._tutorRepository.findOneById(report.reportedId),
        ]);

        return {
          id: report.id!,
          status: report.status,
          type: report.type,
          reportedUser: {
            id: report.reportedId,
            name: reportedUser?.name || reportedTutor?.name || 'Unknown',
            email: reportedUser?.email || reportedTutor?.email || 'N/A',
          },
          date: report.createdAt!.toISOString(),
          description: report.description,
          channel: report.channel,
          rejectionReason: report.rejectionReason,
        };
      }),
    );

    return {
      total: result.total,
      reports: reportsWithDetails,
    };
  }
}
