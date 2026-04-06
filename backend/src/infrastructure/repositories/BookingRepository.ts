import { Booking } from '~entities/Booking';
import { BaseRepository } from './BaseRepository';
import { IBookingRepository, IFetchBookingsParams, IFetchBookingsResponse, IBookingDetail } from '~repository-interfaces/IBookingRepository';
import { IBooking, BookingModel } from '~models/BookingModel';
import { PipelineStage } from 'mongoose';
import { FilterQuery } from '~repository-interfaces/IBaseRepository';
import { env } from '~config/env';
import mongoose from 'mongoose';
import { logger } from '~logger/logger';

export class BookingRepository extends BaseRepository<Booking, IBooking> implements IBookingRepository {
  constructor() {
    super(BookingModel);
  }

  protected toSchema(entity: Booking | Partial<Booking>): IBooking | Partial<IBooking> {
    const schemaObj: Partial<IBooking> = {};
    if (entity.sessionId) schemaObj.sessionId = new mongoose.Types.ObjectId(entity.sessionId);
    if (entity.userId) schemaObj.userId = new mongoose.Types.ObjectId(entity.userId);
    if (entity.tutorId) schemaObj.tutorId = new mongoose.Types.ObjectId(entity.tutorId);
    
    return {
      ...schemaObj,
      payment: entity.payment,
      status: entity.status,
      refundStatus: entity.refundStatus,
      cancelledAt: entity.cancelledAt,
      activeSeconds: entity.activeSeconds,
      topic: entity.topic,
      language: entity.language,
      price: entity.price,
    };
  }

  protected toEntity(doc: IBooking | null): Booking | null {
    if (!doc) return null;
    return new Booking(
      String(doc.sessionId),
      String(doc.userId),
      String(doc.tutorId),
      doc.payment,
      doc.status,
      doc.refundStatus,
      doc.cancelledAt,
      doc.activeSeconds,
      doc.topic,
      doc.language,
      doc.price,
      String(doc._id),
      doc.createdAt,
      doc.updatedAt,
    );
  }
  async fetchBookings(params: IFetchBookingsParams): Promise<IFetchBookingsResponse> {
    const { userId, tutorId, page = 1, limit = 5, search, status, language, sort = 'Newest' } = params;
    const skip = (page - 1) * limit;

    const matchStage: Record<string, unknown> = {};
    if (userId) {
      matchStage.userId = { 
        $in: [
          userId, 
          new mongoose.Types.ObjectId(userId),
        ], 
      };
    }
    if (tutorId) {
      matchStage.tutorId = { 
        $in: [
          tutorId, 
          new mongoose.Types.ObjectId(tutorId),
        ], 
      };
    }

    const basePipeline: PipelineStage[] = [
      { $match: matchStage as PipelineStage.Match['$match'] },
      {
        $lookup: {
          from: 'sessions',
          let: { sId: '$sessionId' },
          pipeline: [{ $match: { $expr: { $or: [{ $eq: ['$_id', '$$sId'] }, { $eq: ['$_id', { $toObjectId: { $toString: '$$sId' } }] }, { $eq: [{ $toString: '$_id' }, { $toString: '$$sId' }] }] } } }],
          as: 'session',
        },
      },
      { $unwind: { path: '$session', preserveNullAndEmptyArrays: true } },

      ...(tutorId ? [
        {
          $lookup: {
            from: 'users',
            let: { uId: '$userId' },
            pipeline: [{ $match: { $expr: { $or: [{ $eq: ['$_id', '$$uId'] }, { $eq: ['$_id', { $toObjectId: { $toString: '$$uId' } }] }, { $eq: [{ $toString: '$_id' }, { $toString: '$$uId' }] }] } } }],
            as: 'user',
          },
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      ] : []),

      ...(userId ? [
        {
          $lookup: {
            from: 'tutors',
            let: { tId: '$tutorId' },
            pipeline: [{ $match: { $expr: { $or: [{ $eq: ['$_id', '$$tId'] }, { $eq: ['$_id', { $toObjectId: { $toString: '$$tId' } }] }, { $eq: [{ $toString: '$_id' }, { $toString: '$$tId' }] }] } } }],
            as: 'tutor',
          },
        },
        { $unwind: { path: '$tutor', preserveNullAndEmptyArrays: true } },
      ] : []),

      {
        $project: {
          id: { $toString: '$_id' },
          sessionId: 1,
          topic: { $ifNull: ['$session.topic', '$topic'] },
          language: { $ifNull: ['$session.language', '$language'] },
          status: 1,
          date: { $ifNull: ['$session.scheduledAt', '$createdAt'] },
          price: { $ifNull: ['$session.price', '$price'] },
          otherPartyName: { $ifNull: [userId ? '$tutor.name' : '$user.name', userId ? 'Unknown Tutor' : 'Unknown User'] },
          otherPartyId: { $cond: { if: { $ne: [userId ? '$tutor._id' : '$user._id', null] }, then: { $toString: userId ? '$tutor._id' : '$user._id' }, else: null } },
          otherPartyRole: userId ? 'tutor' : 'user',
          transactionId: '$payment.transactionId',
          createdAt: 1,
        },
      },
    ];

    const searchStage: FilterQuery<IBooking> = {};
    if (search) {
      searchStage.$or = [
        { topic: { $regex: search, $options: 'i' } },
        { language: { $regex: search, $options: 'i' } },
        { otherPartyName: { $regex: search, $options: 'i' } },
      ];
    }

    const now = new Date();
    const historyThreshold = new Date(now.getTime() - 60 * 60 * 1000);

    const upcomingPipeline = [
      ...basePipeline,
      { $match: { date: { $gt: historyThreshold }, status: { $nin: ['Cancelled', 'Completed'] } } },
      { $sort: { date: 1 as 1 | -1 } },
    ];

    const historyPipeline = [
      ...basePipeline,
      { $match: { $or: [{ date: { $lte: historyThreshold } }, { status: { $in: ['Cancelled', 'Completed'] } }] } },

      ...(status && status !== 'All' ? [{ $match: { status } }] : []),
      ...(language && language !== 'All' ? [{ $match: { language } }] : []),
      ...(Object.keys(searchStage).length > 0 ? [{ $match: searchStage as PipelineStage.Match['$match'] }] : []),

      { $sort: { date: (sort === 'Oldest' ? 1 : -1) as 1 | -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }],
        },
      },
    ];

    const [upcomingResults, historyResults] = await Promise.all([
      this.model.aggregate<IBookingDetail>(upcomingPipeline),
      this.model.aggregate<{ data: IBookingDetail[]; totalCount: { count: number }[] }>(historyPipeline),
    ]);

    const upcoming = upcomingResults;
    const historyData = historyResults[0]?.data || [];
    const totalCount = historyResults[0]?.totalCount?.[0]?.count || 0;

    return {
      upcoming,
      history: {
        data: historyData,
        totalPage: Math.ceil(totalCount / limit),
        currentPage: page,
        totalCount: totalCount,
      },
      callJoinThresholdMinutes: parseInt(env.CALL_JOIN_THRESHOLD_MINUTES || '60'),
    };
  }

  async getDashboardStats(): Promise<{ totalEarnings: number; completedSessions: number; languageStats: { language: string; sessionCount: number }[] }> {
    const cols = await this.model.db.db?.listCollections().toArray();
    const samples = await this.model.find({ status: { $regex: /^completed$/i } }).limit(5);
    
    logger.info(`DB Collections: ${JSON.stringify(cols?.map(c => c.name))}`);
    if (samples.length > 0) {
      for (const sample of samples) {
        const linkedSession = await mongoose.connection.db?.collection('sessions').findOne({ _id: sample.sessionId });
        logger.info(`Sample Check - Booking: ${sample._id}, sessionId: ${sample.sessionId}, SessionFound: ${!!linkedSession}`);
      }
    }

    const results = await this.model.aggregate([
      { $match: { status: { $regex: /^completed$/i } } },
      {
        $lookup: {
          from: 'sessions',
          let: { sId: '$sessionId' },
          pipeline: [
            { 
              $match: { 
                $expr: { 
                  $or: [
                    { $eq: ['$_id', '$$sId'] },
                    { $eq: ['$_id', { $toObjectId: { $toString: '$$sId' } }] },
                    { $eq: [{ $toString: '$_id' }, { $toString: '$$sId' }] },
                  ], 
                }, 
              }, 
            },
          ],
          as: 'session',
        },
      },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalEarnings: { 
                  $sum: { 
                    $ifNull: [
                      { $arrayElemAt: ['$session.price', 0] }, 
                      '$price', 
                    ], 
                  }, 
                },
                completedSessions: { $sum: 1 },
              },
            },
          ],
          languageStats: [
            {
              $group: {
                _id: { $ifNull: [{ $arrayElemAt: ['$session.language', 0] }, '$language'] },
                sessionCount: { $sum: 1 },
              },
            },
            { $project: { language: '$_id', sessionCount: 1, _id: 0 } },
            { $sort: { sessionCount: -1 } },
          ],
        },
      },
    ]);

    const totals = (results[0]?.totals && results[0].totals[0]) || { totalEarnings: 0, completedSessions: 0 };
    const languageStats = results[0]?.languageStats || [];

    return {
      totalEarnings: totals.totalEarnings,
      completedSessions: totals.completedSessions,
      languageStats: languageStats,
    };
  }

  async getRecentSessions(limit: number): Promise<IBookingDetail[]> {
    const results = await this.model.aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'sessions',
          let: { sId: '$sessionId' },
          pipeline: [{ $match: { $expr: { $or: [{ $eq: ['$_id', '$$sId'] }, { $eq: ['$_id', { $toObjectId: { $toString: '$$sId' } }] }, { $eq: [{ $toString: '$_id' }, { $toString: '$$sId' }] }] } } }],
          as: 'session',
        },
      },
      {
        $lookup: {
          from: 'tutors',
          let: { tId: '$tutorId' },
          pipeline: [{ $match: { $expr: { $or: [{ $eq: ['$_id', '$$tId'] }, { $eq: ['$_id', { $toObjectId: { $toString: '$$tId' } }] }, { $eq: [{ $toString: '$_id' }, { $toString: '$$tId' }] }] } } }],
          as: 'tutor',
        },
      },
      { $unwind: { path: '$tutor', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          let: { uId: '$userId' },
          pipeline: [{ $match: { $expr: { $or: [{ $eq: ['$_id', '$$uId'] }, { $eq: ['$_id', { $toObjectId: { $toString: '$$uId' } }] }, { $eq: [{ $toString: '$_id' }, { $toString: '$$uId' }] }] } } }],
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: { $toString: '$_id' },
          sessionId: 1,
          topic: { $ifNull: [{ $arrayElemAt: ['$session.topic', 0] }, 'Unknown Topic'] },
          language: { $ifNull: [{ $arrayElemAt: ['$session.language', 0] }, 'N/A'] },
          status: 1,
          date: { $ifNull: [{ $arrayElemAt: ['$session.scheduledAt', 0] }, '$createdAt'] },
          price: { $ifNull: [{ $arrayElemAt: ['$session.price', 0] }, 0] },
          otherPartyName: { $ifNull: ['$user.name', 'Anonymous'] },
          otherPartyAvatar: null,
          otherPartyId: { $cond: { if: { $ne: ['$user._id', null] }, then: { $toString: '$user._id' }, else: null } },
          otherPartyRole: { $literal: 'user' },
          transactionId: '$payment.transactionId',
          createdAt: 1,
        },
      },
    ]);

    return results as IBookingDetail[];
  }
}
