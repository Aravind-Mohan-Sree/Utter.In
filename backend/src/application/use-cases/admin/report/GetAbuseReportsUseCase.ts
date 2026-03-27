import { IAbuseReportRepository } from '~repository-interfaces/IAbuseReportRepository';
import { IGetAbuseReportsUseCase } from '../../../use-case-interfaces/admin/IAbuseReportUseCase';
import { AbuseReport } from '~entities/AbuseReport';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';

export class GetAbuseReportsUseCase implements IGetAbuseReportsUseCase {
  constructor(
    private _abuseReportRepository: IAbuseReportRepository,
    private _userRepository: IUserRepository,
    private _tutorRepository: ITutorRepository,
  ) { }

  async execute(page: number, limit: number, search?: string, status?: string): Promise<{
    reports: {
      id: string;
      reporter: { id: string; name: string; email: string };
      reported: { id: string; name: string; email: string };
      type: string;
      description: string;
      messages: any[];
      channel: 'chat' | 'video';
      status: 'Pending' | 'Resolved' | 'Rejected';
      createdAt: Date;
    }[];
    total: number;
  }> {
    const result = await this._abuseReportRepository.findAllReports(page, limit, search, status);

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
            role: 'user',
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
      })
    );

    return {
      total: result.total,
      reports: reportsWithDetails,
    };
  }
}
