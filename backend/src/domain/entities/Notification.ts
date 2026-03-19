export class Notification {
  constructor(
    public readonly recipientId: string,
    public readonly recipientRole: 'user' | 'tutor',
    public readonly message: string,
    public readonly type: string,
    public readonly isRead: boolean = false,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly id?: string,
  ) { }
}
