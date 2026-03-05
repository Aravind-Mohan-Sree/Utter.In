import { IBookingRepository } from "~repository-interfaces/IBookingRepository";
import { IGetBookingsUseCase } from "~use-case-interfaces/shared/IGetBookingsUseCase";

import { BookingMapper, BookingResponseDTO } from "~mappers/BookingMapper";
import { GetBookingsDTO } from "~dtos/GetBookingsDTO";

export class GetBookingsUseCase implements IGetBookingsUseCase {
  constructor(
    private bookingRepo: IBookingRepository,
  ) { }

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
    const result = await this.bookingRepo.fetchBookings(req);

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
