export class Review {
  constructor(
    public readonly id: string | undefined,
    public readonly userId: string,
    public readonly tutorId: string,
    public readonly rating: number,
    public readonly note: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly userName?: string,
    public readonly userAvatar?: string,
  ) {}
}
