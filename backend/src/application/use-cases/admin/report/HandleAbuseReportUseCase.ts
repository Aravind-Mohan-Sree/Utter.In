import { IAbuseReportRepository } from '~repository-interfaces/IAbuseReportRepository';
import { IHandleAbuseReportUseCase } from '../../../use-case-interfaces/admin/IAbuseReportUseCase';
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

  async execute(reportId: string, status: 'Resolved' | 'Rejected', rejectionReason?: string): Promise<{
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
  }> {
    const report = await this._abuseReportRepository.findOneById(reportId);
    if (!report) throw new NotFoundError('Report not found');

    if (report.status !== 'Pending') {
      throw new Error('Report is already ' + report.status);
    }

    report.status = status;
    if (status === 'Rejected' && rejectionReason) {
      report.rejectionReason = rejectionReason;
    }

    const [reporter, reportedUser, reportedTutor] = await Promise.all([
      this._userRepository.findOneById(report.reporterId),
      this._userRepository.findOneById(report.reportedId),
      this._tutorRepository.findOneById(report.reportedId),
    ]);

    if (status === 'Resolved') {
      if (reportedUser) {
        await this._userRepository.updateOneById(report.reportedId, { isBlocked: true });
      } else if (reportedTutor) {
        await this._tutorRepository.updateOneById(report.reportedId, { isBlocked: true });
      }
    }

    // Send email to reported person
    const reportedPerson = reportedUser || reportedTutor;
    if (reportedPerson) {
      this._mailService.sendReportUpdate(
        reportedPerson.name,
        reportedPerson.email,
        status,
        rejectionReason,
      ).catch(error => console.error('Failed to send report status email:', error));
    }

    const updated = (await this._abuseReportRepository.updateOneById(reportId, report))!;
    
    return {
      id: updated.id!,
      reporter: {
        id: updated.reporterId,
        name: reporter?.name || 'Unknown',
        email: reporter?.email || 'N/A',
        role: 'user',
      },
      reported: {
        id: updated.reportedId,
        name: reportedUser?.name || reportedTutor?.name || 'Unknown',
        email: reportedUser?.email || reportedTutor?.email || 'N/A',
        role: reportedTutor ? 'tutor' : 'user',
      },
      type: updated.type,
      description: updated.description,
      messages: updated.messages,
      channel: updated.channel,
      status: updated.status,
      createdAt: updated.createdAt!,
    };
  }
}
