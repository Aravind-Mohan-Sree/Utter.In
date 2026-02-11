import { Booking } from '~entities/Booking';

export class BookingMapper {
  static toResponse(booking: Booking) {
    return {
      id: booking.id,
      sessionId: booking.sessionId,
      userId: booking.userId,
      tutorId: booking.tutorId,
      payment: booking.payment,
      status: booking.status,
      refundStatus: booking.refundStatus,
      cancelledAt: booking.cancelledAt,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }
}

export type BookingResponseDTO = ReturnType<typeof BookingMapper.toResponse>;
