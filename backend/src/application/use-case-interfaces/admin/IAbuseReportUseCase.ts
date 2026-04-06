export interface IGetAbuseReportsUseCase {
  execute(page: number, limit: number, search?: string, status?: string): Promise<{
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
  }>;
}

export interface IHandleAbuseReportUseCase {
  execute(reportId: string, status: 'Resolved' | 'Rejected', rejectionReason?: string): Promise<{
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
  }>;
}
