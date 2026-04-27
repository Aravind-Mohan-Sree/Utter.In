import { IWalletRepository } from '~repository-interfaces/IWalletRepository';
import { IGetWalletTransactionsUseCase } from '~use-case-interfaces/shared/IWalletUseCase';
import { Wallet } from '~entities/Wallet';
import { IWallet } from '~models/WalletModel';
import { FilterQuery } from '~repository-interfaces/IBaseRepository';

/**
 * Use case to retrieve wallet balance and transaction history for a user or tutor.
 */
export class GetWalletTransactionsUseCase implements IGetWalletTransactionsUseCase {
  constructor(private _walletRepository: IWalletRepository) { }

  /**
   * Fetches the wallet entity for a specific user.
   * @param userId The unique identifier of the user or tutor.
   * @returns The wallet entity containing transactions, or null if no wallet exists yet.
   */
  async execute(userId: string): Promise<Wallet | null> {
    return await this._walletRepository.findOneByField({ userId } as unknown as FilterQuery<IWallet>);
  }
}
