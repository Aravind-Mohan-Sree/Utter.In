import { Booking } from '~entities/Booking';
import { IBookingRepository } from '~repository-interfaces/IBookingRepository';
import { ISessionRepository } from '~repository-interfaces/ISessionRepository';
import { IPaymentService } from '~service-interfaces/IPaymentService';
import { IVerifyPaymentAndBookUseCase } from '~use-case-interfaces/user/IBookingUseCase';
import { BadRequestError } from '~errors/HttpError';

import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { IMailService } from '~service-interfaces/IMailService';
import { IWalletRepository } from '~repository-interfaces/IWalletRepository';
import { Wallet } from '~entities/Wallet';
import { IWallet } from '~models/WalletModel';
import { FilterQuery } from '~repository-interfaces/IBaseRepository';

export class VerifyPaymentAndBookUseCase implements IVerifyPaymentAndBookUseCase {
  constructor(
    private bookingRepository: IBookingRepository,
    private sessionRepository: ISessionRepository,
    private userRepository: IUserRepository,
    private tutorRepository: ITutorRepository,
    private paymentService: IPaymentService,
    private mailService: IMailService,
    private walletRepository: IWalletRepository,
  ) { }

  async execute(data: {
    orderId: string;
    paymentId: string;
    signature: string;
    sessionId: string;
    userId: string;
    tutorId: string;
    amount: number;
    currency: string;
  }): Promise<null> {
    const isValid = this.paymentService.verifySignature(data.orderId, data.paymentId, data.signature);

    if (!isValid) {
      throw new BadRequestError('Invalid payment signature');
    }

    const session = await this.sessionRepository.findOneById(data.sessionId);
    if (!session) {
      throw new BadRequestError('Session not found');
    }

    const expiresAt = new Date(session.scheduledAt);
    expiresAt.setHours(expiresAt.getHours() + 1);

    const updatedSession = await this.sessionRepository.updateOneByField(
      { _id: data.sessionId, status: 'Available' } as Parameters<ISessionRepository['updateOneByField']>[0],
      { status: 'Booked', expiresAt },
    );

    if (!updatedSession) {
      let wallet = await this.walletRepository.findOneByField({ userId: data.userId } as unknown as FilterQuery<IWallet>);

      if (!wallet) {
        wallet = new Wallet(data.userId, 0, 'INR', []);
        wallet = await this.walletRepository.create(wallet);
      }

      const refundAmount = session.price;

      wallet.balance += refundAmount;
      wallet.transactions.push({
        amount: refundAmount,
        type: 'credit',
        description: `Refund for failed booking (Session already taken): ${session.topic}`,
        date: new Date(),
      });

      await this.walletRepository.updateOneById(wallet.id!, wallet);

      throw new BadRequestError('This session was just booked by someone else. The amount has been refunded to your wallet.');
    }

    const booking = new Booking(
      data.sessionId,
      data.userId,
      data.tutorId,
      {
        provider: 'razorpay',
        transactionId: data.paymentId,
        status: 'success',
        currency: data.currency,
      },
      'confirmed',
      'none',
      null,
    );

    await this.bookingRepository.create(booking);

    const [user, tutor] = await Promise.all([
      this.userRepository.findOneById(data.userId),
      this.tutorRepository.findOneById(data.tutorId),
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

      await Promise.all([
        this.mailService.sendBookingConfirmation(tutor.name, tutor.email, session.topic, session.language, formattedDate, true),
        this.mailService.sendBookingConfirmation(user.name, user.email, session.topic, session.language, formattedDate, false),
      ]);
    }

    return null;
  }
}
