import { Booking } from '~entities/Booking';
import { BaseRepository } from './BaseRepository';
import { IBookingRepository, IFetchBookingsParams, IFetchBookingsResponse, IBookingDetail } from '~repository-interfaces/IBookingRepository';
import { IBooking, BookingModel } from '~models/BookingModel';
import { PipelineStage } from 'mongoose';
import { FilterQuery } from '~repository-interfaces/IBaseRepository';

export class BookingRepository extends BaseRepository<Booking, IBooking> implements IBookingRepository {
  constructor() {
    super(BookingModel);
  }

  protected toSchema(entity: Booking | Partial<Booking>): IBooking | Partial<IBooking> {
    return {
      sessionId: entity.sessionId,
      userId: entity.userId,
      tutorId: entity.tutorId,
      payment: entity.payment,
      status: entity.status,
      refundStatus: entity.refundStatus,
      cancelledAt: entity.cancelledAt,
    };
  }

  protected toEntity(doc: IBooking | null): Booking | null {
    if (!doc) return null;
    return new Booking(
      doc.sessionId,
      doc.userId,
      doc.tutorId,
      doc.payment,
      doc.status,
      doc.refundStatus,
      doc.cancelledAt,
      String(doc._id),
      doc.createdAt,
      doc.updatedAt,
    );
  }
  async fetchBookings(params: IFetchBookingsParams): Promise<IFetchBookingsResponse> {
    const { userId, tutorId, page = 1, limit = 5, search, status, date, language, sort = 'Newest' } = params;
    const skip = (page - 1) * limit;

    const matchStage: Record<string, unknown> = {};

    if (userId) matchStage.userId = userId;
    if (tutorId) matchStage.tutorId = tutorId;

    const basePipeline: PipelineStage[] = [
      { $match: matchStage as PipelineStage.Match['$match'] },

      {
        $lookup: {
          from: 'sessions',
          let: { sessionId: '$sessionId' },
          pipeline: [
            { $addFields: { idStr: { $toString: "$_id" } } },
            { $match: { $expr: { $eq: ["$idStr", "$$sessionId"] } } },
          ],
          as: 'session',
        },
      },
      { $unwind: '$session' },

      ...(tutorId ? [
        {
          $lookup: {
            from: 'users',
            let: { uId: '$userId' },
            pipeline: [
              { $addFields: { idStr: { $toString: "$_id" } } },
              { $match: { $expr: { $eq: ["$idStr", "$$uId"] } } },
            ],
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
            pipeline: [
              { $addFields: { idStr: { $toString: "$_id" } } },
              { $match: { $expr: { $eq: ["$idStr", "$$tId"] } } },
            ],
            as: 'tutor',
          },
        },
        { $unwind: { path: '$tutor', preserveNullAndEmptyArrays: true } },
      ] : []),
    ];

    const searchStage: FilterQuery<IBooking> = {};
    if (search) {
      searchStage.$or = [
        { 'session.topic': { $regex: search, $options: 'i' } },
        { 'session.language': { $regex: search, $options: 'i' } },
      ];
      if (userId) searchStage.$or.push({ 'tutor.name': { $regex: search, $options: 'i' } });
      if (tutorId) searchStage.$or.push({ 'user.name': { $regex: search, $options: 'i' } });
    }

    if (language && language !== 'All') {
      searchStage['session.language'] = language;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      searchStage['session.scheduledAt'] = {
        $gte: startOfDay,
        $lt: endOfDay,
      };
    }

    basePipeline.push({
      $project: {
        id: { $toString: '$_id' },
        sessionId: 1,
        topic: '$session.topic',
        language: '$session.language',
        status: 1,
        date: '$session.scheduledAt',
        price: '$session.price',
        otherPartyName: { $ifNull: [userId ? '$tutor.name' : '$user.name', userId ? 'Unknown Tutor' : 'Unknown User'] },
        otherPartyAvatar: { $ifNull: [userId ? '$tutor.avatarUrl' : '$user.avatarUrl', null] },
        otherPartyId: { $toString: { $ifNull: [userId ? '$tutor._id' : '$user._id', null] } },
        otherPartyRole: userId ? 'tutor' : 'user',
        transactionId: '$payment.transactionId',
        createdAt: 1,
      },
    });

    const now = new Date();
    const historyThreshold = new Date(now.getTime() - 60 * 60 * 1000);

    const upcomingPipeline = [
      ...basePipeline,
      { $match: { date: { $gt: historyThreshold }, status: { $ne: 'Cancelled' } } },
      { $sort: { date: 1 as 1 | -1 } },
    ];

    const historyPipeline = [
      ...basePipeline,
      { $match: { $or: [{ date: { $lte: historyThreshold } }, { status: 'Cancelled' }] } },

      ...(status && status !== 'All' ? [{ $match: { status } }] : []),
      ...(language && language !== 'All' ? [{ $match: { 'session.language': language } }] : []),
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
    };
  }
}
