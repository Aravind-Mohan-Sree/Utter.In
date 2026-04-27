import { AbuseReport } from '~entities/AbuseReport';
import { IAbuseReportRepository } from '~repository-interfaces/IAbuseReportRepository';
import { ICreateAbuseReportUseCase } from '../../../use-case-interfaces/shared/IAbuseReportUseCase';
import { ICloudService } from '~service-interfaces/ICloudService';
import { env } from '~config/env';
import { logger } from '~logger/logger';

/**
 * Use case to submit an abuse report.
 * Processes attached evidence (files) by copying them to a secure report-specific storage location
 * to ensure evidence persists even if the original message or file is deleted.
 */
export class CreateAbuseReportUseCase implements ICreateAbuseReportUseCase {
  constructor(
    private _abuseReportRepository: IAbuseReportRepository,
    private _cloudService: ICloudService,
  ) { }

  /**
   * Processes evidence and persists a new abuse report.
   * @param reporterId ID of the user reporting.
   * @param reportedId ID of the user/tutor being reported.
   * @param type Category of abuse.
   * @param description Detailed description from the reporter.
   * @param messages Relevant chat history serving as evidence.
   * @param channel Where the abuse occurred (chat or video).
   * @returns The created report entity.
   */
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
    // Process messages to copy any linked files into a separate 'reports/' directory in cloud storage
    const processedMessages = await Promise.all(
      messages.map(async (msg) => {
        let reportFileUrl = msg.fileUrl;

        if (msg.fileUrl) {
          try {
            let fromKey = msg.fileUrl;
            
            // Extract the S3 object key from the full URL if necessary
            if (msg.fileUrl.includes('.amazonaws.com/')) {
              const urlParts = msg.fileUrl.split('.amazonaws.com/');
              fromKey = decodeURIComponent(urlParts[urlParts.length - 1]);
            }

            // Generate a unique destination key for the evidence file
            const fileExtension = fromKey.split('.').pop()?.split('?')[0];
            const toKey = `reports/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension || 'bin'}`;

            // Perform the cloud-to-cloud copy
            const copyResult = await this._cloudService.copy(fromKey, toKey);
            if (copyResult.success) {
              reportFileUrl = `https://${env.AWS_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${toKey}`;
            }
          } catch (error) {
            logger.error('Evidence copy failed:', error);
            // Fallback to original URL if copy fails, though this is less reliable as evidence
          }
        }

        return {
          ...msg,
          fileUrl: reportFileUrl,
          text: msg.text || '',
        };
      }),
    );

    // Create and save the report
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
