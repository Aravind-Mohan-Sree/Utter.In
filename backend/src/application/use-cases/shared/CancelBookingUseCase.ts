import { IBookingRepository } from '~repository-interfaces/IBookingRepository';
import { ISessionRepository } from '~repository-interfaces/ISessionRepository';
import { IWalletRepository } from '~repository-interfaces/IWalletRepository';
import { NotFoundError, ForbiddenError, BadRequestError } from '~errors/HttpError';
import { ICancelBookingUseCase } from '~use-case-interfaces/shared/ICancelBookingUseCase';
import { Wallet } from '~entities/Wallet';
import { IWallet } from '~models/WalletModel';
import { FilterQuery } from '~repository-interfaces/IBaseRepository';

import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { IMailService } from '~service-interfaces/IMailService';

export class CancelBookingUseCase implements ICancelBookingUseCase {
  constructor(
        private bookingRepository: IBookingRepository,
        private sessionRepository: ISessionRepository,
        private userRepository: IUserRepository,
        private tutorRepository: ITutorRepository,
        private walletRepository: IWalletRepository,
        private mailService: IMailService,
  ) { }

  async execute(bookingId: string, userId: string, role: string): Promise<boolean> {
    const booking = await this.bookingRepository.findOneById(bookingId);

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (role === 'user' && booking.userId !== userId) {
      throw new ForbiddenError('Not authorized');
    }
    if (role === 'tutor' && booking.tutorId !== userId) {
      throw new ForbiddenError('Not authorized');
    }

    if (booking.status === 'Cancelled') {
      throw new BadRequestError('This booking has already been cancelled');
    }

    const session = await this.sessionRepository.findOneById(booking.sessionId);
    if (!session) {
      throw new NotFoundError('Session not found');
    }

    const now = new Date();
    const scheduledTime = new Date(session.scheduledAt);
    const oneHourBefore = new Date(scheduledTime.getTime() - 60 * 60 * 1000);

    if (now > oneHourBefore) {
      throw new ForbiddenError('Cancellation is only allowed up to 1 hour before the session.');
    }

    let wallet = await this.walletRepository.findOneByField({ userId: booking.userId } as unknown as FilterQuery<IWallet>);

    if (!wallet) {
      wallet = new Wallet(booking.userId, 0, 'INR', []);
      wallet = await this.walletRepository.create(wallet);
    }

    const refundAmount = session.price;

    wallet.balance += refundAmount;
    wallet.transactions.push({
      amount: refundAmount,
      type: 'credit',
      description: `Refund for cancellation of session: ${session.topic} `,
      date: new Date(),
    });

    await this.walletRepository.updateOneById(wallet.id!, wallet);

    await this.bookingRepository.updateOneById(bookingId, { status: 'Cancelled' });

    await this.sessionRepository.updateOneById(session.id as string, { status: 'Available' });

    const [user, tutor] = await Promise.all([
      this.userRepository.findOneById(booking.userId),
      this.tutorRepository.findOneById(booking.tutorId),
    ]);

    if (user && tutor) {
      const formattedDate = new Date(session.scheduledAt).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      if (role === 'tutor') {                
        await this.mailService.sendBookingCancellation(user.name, user.email, session.topic, session.language, formattedDate, refundAmount);
      } else {                
        await this.mailService.sendBookingCancellation(tutor.name, tutor.email, session.topic, session.language, formattedDate);

        await this.mailService.sendBookingCancellation(user.name, user.email, session.topic, session.language, formattedDate, refundAmount);
      }
    }

    return true;
  }
}
