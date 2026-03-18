export interface ParticipantData {
  _id: string;
  name: string;
}

export class Conversation {
  constructor(
    public participants: string[],
    public participantsData?: ParticipantData[],
    public lastMessage?: string,
    public lastMessageText?: string,
    public lastMessageTime?: Date,
    public unreadCount?: Record<string, number>,
    public id?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
