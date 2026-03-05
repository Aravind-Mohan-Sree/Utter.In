import { IBookingRepository } from '~repository-interfaces/IBookingRepository';
import { ISessionRepository } from '~repository-interfaces/ISessionRepository';
import { IRedisService } from '~service-interfaces/IRedisService';
import { env } from '~config/env';
import { IPingBookingUseCase } from '~use-case-interfaces/shared/IPingBookingUseCase';

export class PingBookingUseCase implements IPingBookingUseCase {
    constructor(
        private bookingRepository: IBookingRepository,
        private sessionRepository: ISessionRepository,
        private redisService: IRedisService,
    ) { }

    async execute(bookingId: string, role: string) {
        const pingKey = `booking_ping:${bookingId}:${role}`;
        await this.redisService.set(pingKey, '1', 15);

        const otherRole = role === 'user' ? 'tutor' : 'user';
        const otherPingKey = `booking_ping:${bookingId}:${otherRole}`;
        const isOtherActive = await this.redisService.get(otherPingKey);

        let completed = false;

        if (isOtherActive && role === 'tutor') {
            const booking = await this.bookingRepository.findOneById(bookingId);
            if (!booking) throw new Error('Booking not found');

            if (booking.status === 'Completed') {
                return { completed: true };
            }

            const thresholdMinutes = env.SESSION_COMPLETION_THRESHOLD_MINUTES !== undefined
                ? Number(env.SESSION_COMPLETION_THRESHOLD_MINUTES)
                : 50;

            if (thresholdMinutes === 0) {
                await this.bookingRepository.updateOneById(bookingId, { status: 'Completed' });
                await this.sessionRepository.updateOneById(booking.sessionId, { status: 'Completed' });
                completed = true;
            } else {
                const thresholdMs = thresholdMinutes * 60 * 1000;
                const currentActiveSeconds = booking.activeSeconds || 0;
                const newActiveSeconds = currentActiveSeconds + 5;

                await this.bookingRepository.updateOneById(bookingId, { activeSeconds: newActiveSeconds });

                if (newActiveSeconds * 1000 >= thresholdMs) {
                    await this.bookingRepository.updateOneById(bookingId, { status: 'Completed' });
                    await this.sessionRepository.updateOneById(booking.sessionId, { status: 'Completed' });
                    completed = true;
                }
            }
        } else {
            const booking = await this.bookingRepository.findOneById(bookingId);
            if (booking?.status === 'Completed') {
                completed = true;
            }
        }

        return { completed };
    }
}
