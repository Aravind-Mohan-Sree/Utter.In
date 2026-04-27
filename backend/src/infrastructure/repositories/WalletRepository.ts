import { Wallet } from '~entities/Wallet';
import { BaseRepository } from './BaseRepository';
import { IWalletRepository } from '~repository-interfaces/IWalletRepository';
import { IWallet, WalletModel } from '~models/WalletModel';
import mongoose from 'mongoose';

/**
 * Concrete repository for Wallet entities using Mongoose.
 * Handles financial balances and transaction history for users and tutors.
 */
export class WalletRepository extends BaseRepository<Wallet, IWallet> implements IWalletRepository {
  constructor() {
    super(WalletModel);
  }

  /**
   * Internal mapper to convert domain entity to Mongoose schema object.
   */
  protected toSchema(entity: Wallet | Partial<Wallet>): IWallet | Partial<IWallet> {
    return {
      userId: entity.userId ? new mongoose.Types.ObjectId(entity.userId) : undefined,
      balance: entity.balance,
      currency: entity.currency,
      transactions: entity.transactions,
    };
  }

  /**
   * Internal mapper to convert Mongoose document to domain entity.
   */
  protected toEntity(doc: IWallet | null): Wallet | null {
    if (!doc) return null;
    return new Wallet(
      String(doc.userId),
      doc.balance,
      doc.currency,
      doc.transactions,
      String(doc._id),
      doc.createdAt,
      doc.updatedAt,
    );
  }
}
