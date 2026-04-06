import { AbuseReport } from '~entities/AbuseReport';

export interface ICreateAbuseReportUseCase {
  execute(
    reporterId: string,
    reportedId: string,
    type: string,
    description: string,
    messages: {
      senderId: string;
      text?: string;
      timestamp: Date;
      fileUrl?: string;
      fileType?: string;
      fileName?: string;
    }[],
    channel: 'chat' | 'video',
  ): Promise<AbuseReport>;
}

export interface IGetUserAbuseReportsUseCase {
  execute(userId: string, page: number, limit: number, status?: string): Promise<{
    reports: {
      id: string;
      status: 'Pending' | 'Resolved' | 'Rejected';
      type: string;
      reportedUser: { id: string; name: string; email: string };
      date: string;
      description: string;
      channel: 'video' | 'chat';
      rejectionReason?: string;
    }[];
    total: number;
  }>;
}
