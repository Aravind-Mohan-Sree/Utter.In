import { IBookingRepository } from '~repository-interfaces/IBookingRepository';
import { ISessionRepository } from '~repository-interfaces/ISessionRepository';
import { IRedisService } from '~service-interfaces/IRedisService';
import { env } from '~config/env';
import { IPingBookingUseCase } from '~use-case-interfaces/shared/IPingBookingUseCase';
import { SocketManager } from '~concrete-services/SocketManager';
import { IWalletRepository } from '~repository-interfaces/IWalletRepository';
import { Wallet } from '~entities/Wallet';
import { IWallet } from '~models/WalletModel';
import { FilterQuery } from '~repository-interfaces/IBaseRepository';

export class PingBookingUseCase implements IPingBookingUseCase {
  constructor(
    private _bookingRepository: IBookingRepository,
    private _sessionRepository: ISessionRepository,
    private _redisService: IRedisService,
    private _walletRepository: IWalletRepository,
  ) { }

  async execute(bookingId: string, role: string) {
    const pingKey = `booking_ping:${bookingId}:${role}`;
    await this._redisService.set(pingKey, '1', 15);

    const otherRole = role === 'user' ? 'tutor' : 'user';
    const otherPingKey = `booking_ping:${bookingId}:${otherRole}`;
    const isOtherActive = await this._redisService.get(otherPingKey);

    let completed = false;

    if (isOtherActive && role === 'tutor') {
      const booking = await this._bookingRepository.findOneById(bookingId);
      if (!booking) throw new Error('Booking not found');

      if (booking.status === 'Completed') {
        return { completed: true };
      }

      const thresholdMinutes = env.SESSION_COMPLETION_THRESHOLD_MINUTES !== undefined
        ? Number(env.SESSION_COMPLETION_THRESHOLD_MINUTES)
        : 50;

      if (thresholdMinutes === 0) {
        await this._bookingRepository.updateOneById(bookingId, { status: 'Completed' });
        await this._sessionRepository.updateOneById(booking.sessionId, { status: 'Completed' });
        completed = true;
      } else {
        const thresholdMs = thresholdMinutes * 60 * 1000;
        const currentActiveSeconds = booking.activeSeconds || 0;
        const newActiveSeconds = currentActiveSeconds + 5;

        await this._bookingRepository.updateOneById(bookingId, { activeSeconds: newActiveSeconds });

        if (newActiveSeconds * 1000 >= thresholdMs) {
          await this._bookingRepository.updateOneById(bookingId, { status: 'Completed' });
          await this._sessionRepository.updateOneById(booking.sessionId, { status: 'Completed' });
          completed = true;
        }
      }
      if (completed) {
        try {
          let wallet = await this._walletRepository.findOneByField({ userId: booking.tutorId } as unknown as FilterQuery<IWallet>);

          if (!wallet) {
            wallet = new Wallet(booking.tutorId, 0, 'INR', []);
            wallet = await this._walletRepository.create(wallet);
          }

          const creditAmount = booking.price;
          wallet.balance += creditAmount;
          wallet.transactions.push({
            amount: creditAmount,
            type: 'credit',
            description: `Payment for completed session: ${booking.topic}`,
            date: new Date(),
          });

          await this._walletRepository.updateOneById(wallet.id!, wallet);
        } catch (walletError) {
          console.error('Failed to credit tutor wallet upon session completion', walletError);
        }

        try {
          const sm = SocketManager.getInstance();
          const io = sm.getIO();
          const uSocket = sm.getSocketId(booking.userId);
          const tSocket = sm.getSocketId(booking.tutorId);
                    
          if (uSocket) io.to(uSocket).emit('session_completed');
          if (tSocket) io.to(tSocket).emit('session_completed');
        } catch (err) {
          console.error('Failed to emit session_completed socket event', err);
        }
      }
    } else {
      const booking = await this._bookingRepository.findOneById(bookingId);
      if (booking?.status === 'Completed') {
        completed = true;
      }
    }

    return { completed };
  }
}
