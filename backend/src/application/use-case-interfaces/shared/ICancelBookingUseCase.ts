export interface ICancelBookingUseCase {
    execute(bookingId: string, userId: string, role: string): Promise<boolean>;
}
