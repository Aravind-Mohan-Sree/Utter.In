import { Booking } from '~entities/Booking';
import { BaseRepository } from './BaseRepository';
import { IBookingRepository } from '~repository-interfaces/IBookingRepository';
import { IBooking, BookingModel } from '~models/BookingModel';

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
}
