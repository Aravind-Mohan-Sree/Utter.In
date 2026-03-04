import { BookingResponseDTO } from '~mappers/BookingMapper';
import { GetBookingsDTO } from '~dtos/GetBookingsDTO';

export interface IGetBookingsUseCase {
    execute(req: GetBookingsDTO): Promise<{
        upcoming: BookingResponseDTO[];
        history: {
            data: BookingResponseDTO[];
            totalPage: number;
            currentPage: number;
        }
    }>;
}
