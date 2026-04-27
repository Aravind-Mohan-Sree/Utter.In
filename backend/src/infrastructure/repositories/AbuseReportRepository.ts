import { AbuseReport } from '~entities/AbuseReport';
import { IAbuseReportRepository } from '~repository-interfaces/IAbuseReportRepository';
import { AbuseReportModel, IAbuseReport } from '~models/AbuseReportModel';
import { BaseRepository } from './BaseRepository';
import { Document, Types, PipelineStage } from 'mongoose';
import { FilterQuery } from '~repository-interfaces/IBaseRepository';

/**
 * Concrete repository for Abuse Reports using Mongoose.
 * Handles the storage and retrieval of safety reports, including evidence messages.
 */
export class AbuseReportRepository
  extends BaseRepository<AbuseReport, IAbuseReport>
  implements IAbuseReportRepository {
  constructor() {
    super(AbuseReportModel);
  }

  /**
   * Fetches all reports with search and status filtering for admin overview.
   * Joins with users and tutors to provide full context on who is reporting whom.
   */
  async findAllReports(page: number, limit: number, search?: string, status?: string): Promise<{ reports: AbuseReport[]; total: number }> {
    const pipeline: PipelineStage[] = [];
    const matchStage: Record<string, unknown> = {};

    if (status && status !== 'All') {
      matchStage.status = status;
    }

    pipeline.push({ $match: matchStage });

    // Join with reporter (users) to get name/email for search/display
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'reporterId',
        foreignField: '_id',
        as: 'reporterData',
      },
    });

    // Join with reported user (users)
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'reportedId',
        foreignField: '_id',
        as: 'reportedUserData',
      },
    });

    // Join with reported tutor (tutors)
    pipeline.push({
      $lookup: {
        from: 'tutors',
        localField: 'reportedId',
        foreignField: '_id',
        as: 'reportedTutorData',
      },
    });

    // Apply multi-field search across joined datasets
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'reporterData.name': { $regex: search, $options: 'i' } },
            { 'reporterData.email': { $regex: search, $options: 'i' } },
            { 'reportedUserData.name': { $regex: search, $options: 'i' } },
            { 'reportedUserData.email': { $regex: search, $options: 'i' } },
            { 'reportedTutorData.name': { $regex: search, $options: 'i' } },
            { 'reportedTutorData.email': { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { type: { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    // Paginate results
    pipeline.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [
          { $sort: { createdAt: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
        ],
      },
    });

    const result = await this.model.aggregate(pipeline);
    const reports = result[0].data || [];
    const total = result[0].metadata[0]?.total || 0;

    return {
      total,
      reports: reports.map((doc: IAbuseReport & { _id: Types.ObjectId }) => this.toEntity(doc)!),
    };
  }

  /**
   * Retrieves reports submitted by a specific user.
   */
  async findByReporter(userId: string, page: number, limit: number, status?: string): Promise<{ reports: AbuseReport[]; total: number }> {
    const reporterId = new Types.ObjectId(userId);
    const query: FilterQuery<IAbuseReport> = { reporterId };
    if (status && status !== 'All') {
      query.status = status;
    }
    const total = await this.model.countDocuments(query);
    const docs = await this.model.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      total,
      reports: docs.map(doc => this.toEntity(doc)!),
    };
  }

  /**
   * Internal mapper to convert domain entity to Mongoose schema object.
   */
  protected toSchema(entity: AbuseReport | Partial<AbuseReport>): IAbuseReport | Partial<IAbuseReport> {
    return {
      reporterId: entity.reporterId ? new Types.ObjectId(entity.reporterId) : undefined,
      reportedId: entity.reportedId ? new Types.ObjectId(entity.reportedId) : undefined,
      type: entity.type,
      description: entity.description,
      messages: entity.messages?.map(msg => ({
        senderId: new Types.ObjectId(msg.senderId),
        text: msg.text,
        timestamp: msg.timestamp,
        fileUrl: msg.fileUrl,
        fileType: msg.fileType,
        fileName: msg.fileName,
      })),
      channel: entity.channel,
      status: entity.status,
      rejectionReason: entity.rejectionReason,
    } as Partial<IAbuseReport>;
  }

  /**
   * Internal mapper to convert Mongoose document to domain entity.
   */
  protected toEntity(doc: (IAbuseReport & { _id?: Types.ObjectId; id?: string }) | null): AbuseReport | null {
    if (!doc) return null;

    return new AbuseReport(
      String(doc.reporterId),
      String(doc.reportedId),
      doc.type,
      doc.description,
      (doc.messages || []).map((msg: {
        senderId: Types.ObjectId;
        text?: string;
        timestamp: Date;
        fileUrl?: string;
        fileType?: string;
        fileName?: string;
      }) => ({
        senderId: String(msg.senderId),
        text: msg.text,
        timestamp: msg.timestamp,
        fileUrl: msg.fileUrl,
        fileType: msg.fileType,
        fileName: msg.fileName,
      })),
      doc.channel,
      doc.status,
      doc.rejectionReason,
      String(doc._id || doc.id),
      doc.createdAt,
      doc.updatedAt,
    );
  }

  /**
   * Helper to get most recent reports system-wide.
   */
  getRecentReports = async (limit: number): Promise<AbuseReport[]> => {
    const docs = await this.model.find()
      .sort({ createdAt: -1 })
      .limit(limit);
    return docs.map((doc) => this.toEntity(doc as IAbuseReport & Document<unknown>)!);
  };
}
