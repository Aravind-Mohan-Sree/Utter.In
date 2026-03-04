export class Wallet {
  constructor(
        public readonly userId: string,
        public balance: number,
        public currency: string,
        public transactions: {
            amount: number;
            type: 'credit' | 'debit';
            description: string;
            date: Date;
        }[],
        public readonly id?: string,
        public readonly createdAt?: Date,
        public readonly updatedAt?: Date,
  ) { }
}
