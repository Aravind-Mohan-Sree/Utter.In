import { Message } from '~entities/Message';
import { IMessageRepository } from '~repository-interfaces/IMessageRepository';
import { MessageModel, IMessage } from '~models/MessageModel';
import { BaseRepository } from './BaseRepository';
import mongoose from 'mongoose';

/**
 * Concrete repository for Message entities using Mongoose.
 * Handles storage, retrieval, and search of individual chat messages.
 */
export class MessageRepository
  extends BaseRepository<Message, IMessage>
  implements IMessageRepository
{
  constructor() {
    super(MessageModel);
  }

  /**
   * Internal mapper to convert domain entity to Mongoose schema object.
   * Handles optional fields like files and hidden status.
   */
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
      fileUrl: entity.fileUrl,
      fileType: entity.fileType,
      fileName: entity.fileName,
    } as Partial<IMessage>;
  }

  /**
   * Internal mapper to convert Mongoose document to domain entity.
   */
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
      doc.fileUrl,
      doc.fileType,
      doc.fileName,
      String(doc._id),
      doc.createdAt,
      doc.updatedAt,
    );
  }

  /**
   * Retrieves messages for a specific conversation with optional pagination.
   */
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
    
    // Return chronological order for UI
    return options ? entities.reverse() : entities;
  }

  /**
   * Bulk updates messages as read for a specific recipient in a conversation.
   */
  async markAsRead(conversationId: string, receiverId: string): Promise<void> {
    await MessageModel.updateMany(
      { conversationId, receiverId, isRead: false },
      { $set: { isRead: true } },
    );
  }

  /**
   * Searches for specific text within a user's messages.
   * Excludes messages that the user has hidden.
   */
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
