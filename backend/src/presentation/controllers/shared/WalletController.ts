import { Request, Response, NextFunction } from 'express';
import { IGetWalletTransactionsUseCase } from '~use-case-interfaces/shared/IWalletUseCase';
import { httpStatusCode } from '~constants/httpStatusCode';
import { logger } from '~logger/logger';

interface IAuthenticatedRequest extends Request {
  user: {
    id: string;
    role: 'user' | 'tutor' | 'admin';
  };
}

/**
 * Controller for managing user/tutor wallets.
 * Provides access to balance and transaction history.
 */
export class WalletController {
  constructor(private _getWalletTransactionsUseCase: IGetWalletTransactionsUseCase) { }

  /**
   * Retrieves the wallet details for the authenticated user.
   */
  getTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as unknown as IAuthenticatedRequest).user;
      const userId = user.id;

      // Fetch the wallet data using the use case
      const wallet = await this._getWalletTransactionsUseCase.execute(userId);

      res.status(httpStatusCode.OK).json({
        success: true,
        wallet: wallet ? {
          balance: wallet.balance,
          transactions: wallet.transactions,
        } : {
          // If no wallet exists yet, return a default zeroed-out state
          balance: 0,
          transactions: [],
        },
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}
