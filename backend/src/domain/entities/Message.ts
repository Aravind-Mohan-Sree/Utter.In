export class Message {
  constructor(
    public senderId: string,
    public receiverId: string,
    public text: string,
    public conversationId: string,
    public isRead: boolean = false,
    public isDeleted: boolean = false,
    public isEdited: boolean = false,
    public hiddenBy: string[] = [],
    public id?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
