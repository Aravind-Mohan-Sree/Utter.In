import { IWalletRepository } from '~repository-interfaces/IWalletRepository';
import { IGetWalletTransactionsUseCase } from '~use-case-interfaces/shared/IWalletUseCase';
import { Wallet } from '~entities/Wallet';
import { IWallet } from '~models/WalletModel';
import { FilterQuery } from '~repository-interfaces/IBaseRepository';

export class GetWalletTransactionsUseCase implements IGetWalletTransactionsUseCase {
  constructor(private _walletRepository: IWalletRepository) { }

  async execute(userId: string): Promise<Wallet | null> {
    return await this._walletRepository.findOneByField({ userId } as unknown as FilterQuery<IWallet>);
  }
}
