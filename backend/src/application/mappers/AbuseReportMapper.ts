import { AbuseReport } from '~entities/AbuseReport';

export interface IUserAbuseReportResponseDTO {
  id: string;
  status: 'Pending' | 'Resolved' | 'Rejected';
  type: string;
  reportedUser: { id: string; name: string };
  date: string;
  description: string;
  channel: 'video' | 'chat';
  rejectionReason?: string;
}

export interface IAdminAbuseReportResponseDTO {
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
}

export class AbuseReportMapper {
  static toUserResponse(data: any): IUserAbuseReportResponseDTO {
    return {
      id: data.id,
      status: data.status,
      type: data.type,
      reportedUser: {
        id: data.reportedUser.id,
        name: data.reportedUser.name,
      },
      date: data.date,
      description: data.description,
      channel: data.channel,
      rejectionReason: data.rejectionReason,
    };
  }

  static toAdminResponse(data: any): IAdminAbuseReportResponseDTO {
    return {
      id: data.id,
      reporter: data.reporter,
      reported: data.reported,
      type: data.type,
      description: data.description,
      messages: data.messages,
      channel: data.channel,
      status: data.status,
      createdAt: data.createdAt,
    };
  }
}
