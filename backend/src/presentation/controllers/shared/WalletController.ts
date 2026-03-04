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

export class WalletController {
  constructor(private getWalletTransactionsUseCase: IGetWalletTransactionsUseCase) { }

  getTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as unknown as IAuthenticatedRequest).user;
      const userId = user.id;

      const wallet = await this.getWalletTransactionsUseCase.execute(userId);

      res.status(httpStatusCode.OK).json({
        success: true,
        wallet: wallet ? {
          balance: wallet.balance,
          transactions: wallet.transactions,
        } : {
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
