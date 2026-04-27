import { IBookingRepository } from "~repository-interfaces/IBookingRepository";
import { IGetBookingsUseCase } from "~use-case-interfaces/shared/IGetBookingsUseCase";

import { BookingMapper, BookingResponseDTO } from "~mappers/BookingMapper";
import { GetBookingsDTO } from "~dtos/GetBookingsDTO";

/**
 * Use case to retrieve bookings for a user or tutor.
 * Splits bookings into upcoming sessions and historical records.
 */
export class GetBookingsUseCase implements IGetBookingsUseCase {
  constructor(
    private _bookingRepo: IBookingRepository,
  ) { }

  /**
   * Fetches and categorizes bookings based on the request parameters.
   * @param req Data transfer object containing filters (userId, tutorId, pagination).
   * @returns Categorized bookings and metadata.
   */
  async execute(req: GetBookingsDTO): Promise<{
    upcoming: BookingResponseDTO[];
    history: {
      data: BookingResponseDTO[];
      totalPage: number;
      currentPage: number;
      totalCount: number;
    };
    callJoinThresholdMinutes: number;
  }> {
    // Fetch raw booking data from repository
    const result = await this._bookingRepo.fetchBookings(req);

    // Map entities to response DTOs for both upcoming and historical categories
    return {
      upcoming: result.upcoming.map(booking => BookingMapper.toResponse(booking)),
      history: {
        ...result.history,
        data: result.history.data.map(booking => BookingMapper.toResponse(booking)),
        totalCount: result.history.totalCount,
      },
      callJoinThresholdMinutes: result.callJoinThresholdMinutes,
    };
  }
}
