import { Message } from '~entities/Message';
import { IMessageRepository } from '~repository-interfaces/IMessageRepository';
import { MessageModel, IMessage } from '~models/MessageModel';
import { BaseRepository } from './BaseRepository';
import mongoose from 'mongoose';

export class MessageRepository
  extends BaseRepository<Message, IMessage>
  implements IMessageRepository
{
  constructor() {
    super(MessageModel);
  }

  protected toSchema(
    entity: Message | Partial<Message>,
  ): IMessage | Partial<IMessage> {
    return {
      conversationId: entity.conversationId
        ? new mongoose.Types.ObjectId(entity.conversationId)
        : undefined,
      senderId: entity.senderId
        ? new mongoose.Types.ObjectId(entity.senderId)
        : undefined,
      receiverId: entity.receiverId
        ? new mongoose.Types.ObjectId(entity.receiverId)
        : undefined,
      text: entity.text,
      isRead: entity.isRead,
      isDeleted: entity.isDeleted,
      isEdited: entity.isEdited,
      hiddenBy: entity.hiddenBy?.map((id) => new mongoose.Types.ObjectId(id)),
    } as Partial<IMessage>;
  }

  protected toEntity(doc: IMessage | null): Message | null {
    if (!doc) return null;
    return new Message(
      String(doc.senderId),
      String(doc.receiverId),
      doc.text,
      String(doc.conversationId),
      doc.isRead,
      doc.isDeleted,
      doc.isEdited,
      doc.hiddenBy?.map((id) => String(id)),
      String(doc._id),
      doc.createdAt,
      doc.updatedAt,
    );
  }

  async findByConversationId(
    conversationId: string,
    options?: { limit?: number; skip?: number },
  ): Promise<Message[]> {
    let query = MessageModel.find({ conversationId });

    if (options) {
      if (options.skip !== undefined) query = query.skip(options.skip);
      if (options.limit !== undefined) query = query.limit(options.limit);
      query = query.sort({ createdAt: -1 });
    } else {
      query = query.sort({ createdAt: 1 });
    }

    const docs = await query;
    const entities = docs.map((doc) => this.toEntity(doc)!);
    
    return options ? entities.reverse() : entities;
  }

  async markAsRead(conversationId: string, receiverId: string): Promise<void> {
    await MessageModel.updateMany(
      { conversationId, receiverId, isRead: false },
      { $set: { isRead: true } },
    );
  }

  async searchMessages(userId: string, query: string): Promise<Message[]> {
    const userObjId = new mongoose.Types.ObjectId(userId);
    const docs = await MessageModel.find({
      $or: [{ senderId: userObjId }, { receiverId: userObjId }],
      text: { $regex: query, $options: 'i' },
      hiddenBy: { $ne: userObjId },
    })
      .sort({ createdAt: -1 })
      .limit(50);

    return docs.map((doc) => this.toEntity(doc)!);
  }
}
