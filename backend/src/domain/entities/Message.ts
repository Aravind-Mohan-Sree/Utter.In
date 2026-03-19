export class Message {
  constructor(
    public senderId: string,
    public receiverId: string,
    public text: string,
    public conversationId: string,
    public isRead = false,
    public isDeleted = false,
    public isEdited = false,
    public hiddenBy: string[] = [],
    public id?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
