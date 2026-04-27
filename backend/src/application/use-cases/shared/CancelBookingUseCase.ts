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
import { ICreateNotificationUseCase } from '~use-case-interfaces/shared/INotificationUseCase';

/**
 * Use case to cancel a session booking.
 * Handles validation, refunding to the user's wallet, updating session availability,
 * and notifying both parties about the cancellation.
 */
export class CancelBookingUseCase implements ICancelBookingUseCase {
  constructor(
        private _bookingRepository: IBookingRepository,
        private _sessionRepository: ISessionRepository,
        private _userRepository: IUserRepository,
        private _tutorRepository: ITutorRepository,
        private _walletRepository: IWalletRepository,
        private _mailService: IMailService,
        private _createNotificationUseCase: ICreateNotificationUseCase,
  ) { }

  /**
   * Executes the cancellation process.
   * @param bookingId The ID of the booking to cancel.
   * @param userId The ID of the user (or tutor) requesting the cancellation.
   * @param role The role of the requester (user/tutor).
   * @returns True if successful.
   */
  async execute(bookingId: string, userId: string, role: string): Promise<boolean> {
    const booking = await this._bookingRepository.findOneById(bookingId);

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Authorization check: only the participant can cancel their booking
    if (role === 'user' && booking.userId !== userId) {
      throw new ForbiddenError('Not authorized');
    }
    if (role === 'tutor' && booking.tutorId !== userId) {
      throw new ForbiddenError('Not authorized');
    }

    if (booking.status === 'Cancelled') {
      throw new BadRequestError('This booking has already been cancelled');
    }

    const session = await this._sessionRepository.findOneById(booking.sessionId);
    if (!session) {
      throw new NotFoundError('Session not found');
    }

    // Cancellation policy: only allowed up to 1 hour before scheduled time
    const now = new Date();
    const scheduledTime = new Date(session.scheduledAt);
    const oneHourBefore = new Date(scheduledTime.getTime() - 60 * 60 * 1000);

    if (now > oneHourBefore) {
      throw new ForbiddenError('Cancellation is only allowed up to 1 hour before the session.');
    }

    // Handle refund to user's wallet
    let wallet = await this._walletRepository.findOneByField({ userId: booking.userId } as unknown as FilterQuery<IWallet>);

    if (!wallet) {
      wallet = new Wallet(booking.userId, 0, 'INR', []);
      wallet = await this._walletRepository.create(wallet);
    }

    const refundAmount = session.price;

    wallet.balance += refundAmount;
    wallet.transactions.push({
      amount: refundAmount,
      type: 'credit',
      description: `Refund for cancellation of session: ${session.topic} `,
      date: new Date(),
    });

    // Update wallet and booking status
    await this._walletRepository.updateOneById(wallet.id!, wallet);

    await this._bookingRepository.updateOneById(bookingId, { status: 'Cancelled' });

    // Make the session available for booking again
    await this._sessionRepository.updateOneById(session.id as string, { status: 'Available' });

    // Notify parties
    const [user, tutor] = await Promise.all([
      this._userRepository.findOneById(booking.userId),
      this._tutorRepository.findOneById(booking.tutorId),
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
        // If tutor cancelled, notify student and provide refund info
        await this._mailService.sendBookingCancellation(user.name, user.email, session.topic, session.language, formattedDate, refundAmount);
        await this._createNotificationUseCase.execute({
          recipientId: user.id!,
          recipientRole: 'user',
          message: `Your session on ${session.topic} was cancelled by ${tutor.name}`,
          type: 'cancellation',
        });
      } else {                
        // If student cancelled, notify tutor and student
        await this._mailService.sendBookingCancellation(tutor.name, tutor.email, session.topic, session.language, formattedDate);
        await this._createNotificationUseCase.execute({
          recipientId: tutor.id!,
          recipientRole: 'tutor',
          message: `The session with ${user.name} on ${session.topic} was cancelled`,
          type: 'cancellation',
        });

        await this._mailService.sendBookingCancellation(user.name, user.email, session.topic, session.language, formattedDate, refundAmount);
      }
    }

    return true;
  }
}
