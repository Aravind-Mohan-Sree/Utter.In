export class AbuseReport {
  constructor(
    public reporterId: string,
    public reportedId: string,
    public type: string,
    public description: string,
    public messages: {
      senderId: string;
      text?: string;
      timestamp: Date;
      fileUrl?: string;
      fileType?: string;
      fileName?: string;
    }[],
    public channel: 'chat'| 'video',
    public status: 'Pending' | 'Resolved' | 'Rejected' = 'Pending',
    public rejectionReason?: string,
    public id?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) { }
}
