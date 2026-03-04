import { Wallet } from '~entities/Wallet';

export interface IGetWalletTransactionsUseCase {
    execute(userId: string): Promise<Wallet | null>;
}
