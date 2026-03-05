export interface IPingBookingUseCase {
    execute(bookingId: string, role: string): Promise<{ completed: boolean }>;
}
