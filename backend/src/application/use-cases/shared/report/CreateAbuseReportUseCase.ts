import { AbuseReport } from '~entities/AbuseReport';
import { IAbuseReportRepository } from '~repository-interfaces/IAbuseReportRepository';
import { ICreateAbuseReportUseCase } from '../../../use-case-interfaces/shared/IAbuseReportUseCase';
import { ICloudService } from '~service-interfaces/ICloudService';
import { env } from '~config/env';

export class CreateAbuseReportUseCase implements ICreateAbuseReportUseCase {
  constructor(
    private _abuseReportRepository: IAbuseReportRepository,
    private _cloudService: ICloudService,
  ) { }

  async execute(
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
  ): Promise<AbuseReport> {
    const processedMessages = await Promise.all(
      messages.map(async (msg) => {
        let reportFileUrl = msg.fileUrl;

        if (msg.fileUrl) {
          try {
            let fromKey = msg.fileUrl;
            
            if (msg.fileUrl.includes('.amazonaws.com/')) {
              const urlParts = msg.fileUrl.split('.amazonaws.com/');
              fromKey = decodeURIComponent(urlParts[urlParts.length - 1]);
            }

            const fileExtension = fromKey.split('.').pop()?.split('?')[0];
            const toKey = `reports/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension || 'bin'}`;

            const copyResult = await this._cloudService.copy(fromKey, toKey);
            if (copyResult.success) {
              reportFileUrl = `https://${env.AWS_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${toKey}`;
            }
          } catch (error) {
            console.error('Evidence copy failed:', error);
          }
        }

        return {
          ...msg,
          fileUrl: reportFileUrl,
          text: msg.text || '',
        };
      }),
    );

    const report = new AbuseReport(
      reporterId,
      reportedId,
      type,
      description,
      processedMessages,
      channel,
      'Pending',
    );

    return this._abuseReportRepository.create(report);
  }
}
