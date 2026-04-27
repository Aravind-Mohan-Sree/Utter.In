import { IAbuseReportRepository } from '~repository-interfaces/IAbuseReportRepository';
import { IHandleAbuseReportUseCase } from '../../../use-case-interfaces/admin/IAbuseReportUseCase';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { NotFoundError } from '~errors/HttpError';
import { IMailService } from '~service-interfaces/IMailService';
import { logger } from '~logger/logger';

/**
 * Use case to handle the resolution or rejection of an abuse report.
 * If resolved, the reported user/tutor is automatically blocked.
 */
export class HandleAbuseReportUseCase implements IHandleAbuseReportUseCase {
  constructor(
    private _abuseReportRepository: IAbuseReportRepository,
    private _userRepository: IUserRepository,
    private _tutorRepository: ITutorRepository,
    private _mailService: IMailService,
  ) { }

  /**
   * Updates a report's status and takes necessary actions (like blocking).
   * @param reportId The unique ID of the report.
   * @param status The new status (Resolved or Rejected).
   * @param rejectionReason Optional reason if rejected.
   * @returns The updated report details.
   */
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

    // Only pending reports can be handled
    if (report.status !== 'Pending') {
      throw new Error('Report is already ' + report.status);
    }

    report.status = status;
    if (status === 'Rejected' && rejectionReason) {
      report.rejectionReason = rejectionReason;
    }

    // Fetch details for both parties
    const [reporter, reportedUser, reportedTutor] = await Promise.all([
      this._userRepository.findOneById(report.reporterId),
      this._userRepository.findOneById(report.reportedId),
      this._tutorRepository.findOneById(report.reportedId),
    ]);

    // If report is resolved (action taken), block the reported account
    if (status === 'Resolved') {
      if (reportedUser) {
        await this._userRepository.updateOneById(report.reportedId, { isBlocked: true });
      } else if (reportedTutor) {
        await this._tutorRepository.updateOneById(report.reportedId, { isBlocked: true });
      }
    }

    // Notify the reported person about the outcome via email
    const reportedPerson = reportedUser || reportedTutor;
    if (reportedPerson) {
      this._mailService.sendReportUpdate(
        reportedPerson.name,
        reportedPerson.email,
        status,
        rejectionReason,
      ).catch(error => logger.error('Failed to send report status email:', error));
    }

    // Persist the report status change
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
