import { IAbuseReportRepository } from '~repository-interfaces/IAbuseReportRepository';
import { IGetUserAbuseReportsUseCase } from '../../../use-case-interfaces/user/IAbuseReportUseCase';
import { AbuseReport } from '~entities/AbuseReport';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';

export class GetUserAbuseReportsUseCase implements IGetUserAbuseReportsUseCase {
  constructor(
    private _abuseReportRepository: IAbuseReportRepository,
    private _userRepository: IUserRepository,
    private _tutorRepository: ITutorRepository,
  ) { }

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
    const result = await this._abuseReportRepository.findByReporter(userId, page, limit, status);

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
      })
    );

    return {
      total: result.total,
      reports: reportsWithDetails,
    };
  }
}
