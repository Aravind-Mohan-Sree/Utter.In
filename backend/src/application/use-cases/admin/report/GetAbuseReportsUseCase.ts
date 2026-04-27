import { IAbuseReportRepository } from '~repository-interfaces/IAbuseReportRepository';
import { IGetAbuseReportsUseCase } from '../../../use-case-interfaces/admin/IAbuseReportUseCase';

import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';

/**
 * Use case to retrieve abuse reports for admin review.
 * Fetches reports with detailed information about the reporter and reported entity.
 */
export class GetAbuseReportsUseCase implements IGetAbuseReportsUseCase {
  constructor(
    private _abuseReportRepository: IAbuseReportRepository,
    private _userRepository: IUserRepository,
    private _tutorRepository: ITutorRepository,
  ) { }

  /**
   * Retrieves a paginated list of abuse reports with reporter/reported details.
   * @param page Current page number.
   * @param limit Number of reports per page.
   * @param search Optional search query.
   * @param status Optional filter by status (Pending, Resolved, Rejected).
   * @returns Detailed report objects and total count.
   */
  async execute(page: number, limit: number, search?: string, status?: string): Promise<{
    reports: {
      id: string;
      reporter: { id: string; name: string; email: string; role: string };
      reported: { id: string; name: string; email: string; role: string };
      type: string;
      description: string;
      messages: {
        senderId: string;
        text?: string;
        timestamp: Date;
        fileUrl?: string;
        fileType?: string;
        fileName?: string;
      }[];
      channel: 'chat' | 'video';
      status: 'Pending' | 'Resolved' | 'Rejected';
      createdAt: Date;
    }[];
    total: number;
  }> {
    // Fetch raw reports from repository
    const result = await this._abuseReportRepository.findAllReports(page, limit, search, status);

    // Enrich reports with user/tutor details for better admin readability
    const reportsWithDetails = await Promise.all(
      result.reports.map(async (report) => {
        const [reporter, reportedUser, reportedTutor] = await Promise.all([
          this._userRepository.findOneById(report.reporterId),
          this._userRepository.findOneById(report.reportedId),
          this._tutorRepository.findOneById(report.reportedId),
        ]);

        return {
          id: report.id!,
          reporter: {
            id: report.reporterId,
            name: reporter?.name || 'Unknown',
            email: reporter?.email || 'N/A',
            role: 'user', // Reporters are always regular users in this system
          },
          reported: {
            id: report.reportedId,
            name: reportedUser?.name || reportedTutor?.name || 'Unknown',
            email: reportedUser?.email || reportedTutor?.email || 'N/A',
            role: reportedTutor ? 'tutor' : 'user',
          },
          type: report.type,
          description: report.description,
          messages: report.messages,
          channel: report.channel,
          status: report.status,
          createdAt: report.createdAt!,
        };
      }),
    );

    return {
      total: result.total,
      reports: reportsWithDetails,
    };
  }
}
