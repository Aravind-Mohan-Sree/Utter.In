import { AbuseReport } from '~entities/AbuseReport';

export interface IGetAbuseReportsUseCase {
  execute(page: number, limit: number, search?: string, status?: string): Promise<{
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
  }>;
}

export interface IHandleAbuseReportUseCase {
  execute(reportId: string, status: 'Resolved' | 'Rejected', rejectionReason?: string): Promise<AbuseReport>;
}
