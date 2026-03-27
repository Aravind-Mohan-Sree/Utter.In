import { IAbuseReportRepository } from '~repository-interfaces/IAbuseReportRepository';
import { IHandleAbuseReportUseCase } from '../../../use-case-interfaces/admin/IAbuseReportUseCase';
import { AbuseReport } from '~entities/AbuseReport';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { NotFoundError } from '~errors/HttpError';
import { IMailService } from '~service-interfaces/IMailService';

export class HandleAbuseReportUseCase implements IHandleAbuseReportUseCase {
  constructor(
    private _abuseReportRepository: IAbuseReportRepository,
    private _userRepository: IUserRepository,
    private _tutorRepository: ITutorRepository,
    private _mailService: IMailService,
  ) { }

  async execute(reportId: string, status: 'Resolved' | 'Rejected', rejectionReason?: string): Promise<AbuseReport> {
    const report = await this._abuseReportRepository.findOneById(reportId);
    if (!report) throw new NotFoundError('Report not found');

    if (report.status !== 'Pending') {
      throw new Error('Report is already ' + report.status);
    }

    report.status = status;
    if (status === 'Rejected' && rejectionReason) {
      report.rejectionReason = rejectionReason;
    }

    const reportedId = report.reportedId;
    const [user, tutor] = await Promise.all([
      this._userRepository.findOneById(reportedId),
      this._tutorRepository.findOneById(reportedId),
    ]);

    if (status === 'Resolved') {
      if (user) {
        await this._userRepository.updateOneById(reportedId, { isBlocked: true } as any);
      } else if (tutor) {
        await this._tutorRepository.updateOneById(reportedId, { isBlocked: true } as any);
      }
    }

    // Send email to reported person
    const reportedPerson = user || tutor;
    if (reportedPerson) {
      this._mailService.sendReportUpdate(
        reportedPerson.name,
        reportedPerson.email,
        status,
        rejectionReason
      ).catch(error => console.error('Failed to send report status email:', error));
    }

    const updated = await this._abuseReportRepository.updateOneById(reportId, report);
    return updated!;
  }
}
