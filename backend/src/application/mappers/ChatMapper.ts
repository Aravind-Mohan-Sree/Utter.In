import { Conversation } from '~entities/Conversation';
import { Message } from '~entities/Message';

export class ChatMapper {
  static toConversationResponse(conv: Conversation) {
    return {
      id: conv.id,
      participants: conv.participants,
      lastMessageText: conv.lastMessageText,
      lastMessageTime: conv.lastMessageTime,
      unreadCount: conv.unreadCount,
      participantsData: conv.participantsData,
      updatedAt: conv.updatedAt,
    };
  }

  static toMessageResponse(msg: Message) {
    return {
      id: msg.id,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      text: msg.text,
      conversationId: msg.conversationId,
      isRead: msg.isRead,
      isDeleted: msg.isDeleted,
      isEdited: msg.isEdited,
      hiddenBy: msg.hiddenBy,
      createdAt: msg.createdAt,
    };
  }

  static toConversationList(conversations: Conversation[]) {
    return conversations.map((c) => this.toConversationResponse(c));
  }

  static toMessageList(messages: Message[]) {
    return messages.map((m) => this.toMessageResponse(m));
  }
}
