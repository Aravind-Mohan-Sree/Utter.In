export class Booking {
  constructor(
        public sessionId: string,
        public userId: string,
        public tutorId: string,
        public payment: {
            provider: string;
            transactionId: string;
            status: string;
            currency: string;
        },
        public status: string,
        public refundStatus: string,
        public cancelledAt: Date | null,
        public id?: string,
        public createdAt?: Date,
        public updatedAt?: Date,
  ) { }
}
