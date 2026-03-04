import { Wallet } from '~entities/Wallet';
import { IBaseRepository } from './IBaseRepository';
import { IWallet } from '~models/WalletModel';

export interface IWalletRepository extends IBaseRepository<Wallet, IWallet> {
}
