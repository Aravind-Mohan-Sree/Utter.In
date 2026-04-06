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
    public activeSeconds: number = 0,
    public topic: string = 'Unknown Topic',
    public language: string = 'N/A',
    public price: number = 0,
    public id?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) { }
}
