import { Conversation } from '~entities/Conversation';
import { IConversationRepository } from '~repository-interfaces/IConversationRepository';
import { ConversationModel, IConversation } from '~models/ConversationModel';
import { MessageModel } from '~models/MessageModel';
import { BaseRepository } from './BaseRepository';
import mongoose from 'mongoose';

export class ConversationRepository
  extends BaseRepository<Conversation, IConversation>
  implements IConversationRepository
{
  constructor() {
    super(ConversationModel);
  }

  protected toSchema(
    entity: Conversation | Partial<Conversation>,
  ): IConversation | Partial<IConversation> {
    return {
      participants: entity.participants?.map(
        (id) => new mongoose.Types.ObjectId(id),
      ),
      lastMessage: entity.lastMessage
        ? new mongoose.Types.ObjectId(entity.lastMessage)
        : undefined,
      unreadCount: entity.unreadCount
        ? new Map(Object.entries(entity.unreadCount))
        : undefined,
    } as Partial<IConversation>;
  }

  protected toEntity(doc: IConversation | null): Conversation | null {
    if (!doc) return null;

    const unreadCountObj: Record<string, number> = {};
    if (doc.unreadCount) {
      doc.unreadCount.forEach((val, key) => {
        unreadCountObj[key] = val;
      });
    }

    const participantsData: any[] = [];
    const participants: string[] = [];

    doc.participants.forEach((p: any) => {
      if (p && typeof p === 'object' && p._id) {
        participants.push(String(p._id));
        participantsData.push({
          _id: String(p._id),
          name: p.name,
        });
      } else if (p) {
        participants.push(String(p));
      }
    });

    return new Conversation(
      participants,
      participantsData.length > 0 ? participantsData : undefined,
      doc.lastMessage ? String(doc.lastMessage) : undefined,
      (doc as any).lastMessage?.text,
      (doc as any).lastMessage?.createdAt,
      unreadCountObj,
      String(doc._id),
      doc.createdAt,
      doc.updatedAt,
    );
  }

  async findByParticipants(participants: string[]): Promise<Conversation | null> {
    const sortedParticipants = [...participants].sort();
    const doc = await ConversationModel.findOne({
      participants: { $all: sortedParticipants, $size: sortedParticipants.length },
    });
    return this.toEntity(doc);
  }

  async findUserConversations(userId: string): Promise<Conversation[]> {
    const docs = await ConversationModel.find({
      participants: userId,
    })
      .populate({
        path: 'lastMessage',
        model: 'messages',
      })
      .populate({
        path: 'participants',
        model: 'users',
        select: 'name isBlocked role',
      })
      .sort({ updatedAt: -1 });

    const filteredDocs = await Promise.all(
      docs.map(async (doc) => {
        const isAnyOtherBlocked = doc.participants.some(
          (p: any) => p && String(p._id) !== userId && p.isBlocked,
        );
        if (isAnyOtherBlocked) return null;

        let lastMsg = (doc as any).lastMessage;

        if (
          lastMsg &&
          lastMsg.hiddenBy?.some((id: any) => String(id) === String(userId))
        ) {
          const actualLastMsg = await MessageModel.findOne({
            conversationId: doc._id,
            hiddenBy: { $ne: new mongoose.Types.ObjectId(userId) },
          }).sort({ createdAt: -1 });

          if (actualLastMsg) {
            (doc as any).lastMessage = actualLastMsg;
          } else {
            (doc as any).lastMessage = null;
          }
        }

        const entity = this.toEntity(doc)!;
        return entity;
      }),
    );
    return filteredDocs.filter((conv): conv is NonNullable<typeof conv> => conv !== null);
  }

  async resetUnreadCount(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    await ConversationModel.updateOne(
      { _id: conversationId },
      { $set: { [`unreadCount.${userId}`]: 0 } },
    );
  }
}
