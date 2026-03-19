import { Conversation } from '~entities/Conversation';
import { IConversationRepository } from '~repository-interfaces/IConversationRepository';
import { ConversationModel, IConversation } from '~models/ConversationModel';
import { MessageModel, IMessage } from '~models/MessageModel';
import { BaseRepository } from './BaseRepository';
import mongoose from 'mongoose';

interface PopulatedParticipant {
  _id: mongoose.Types.ObjectId;
  name: string;
  isBlocked: boolean;
  role: string;
}

interface PopulatedConversation extends Omit<IConversation, 'lastMessage' | 'participants'> {
  lastMessage: IMessage | null;
  participants: PopulatedParticipant[];
}

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

    const participantsData: { _id: string; name: string }[] = [];
    const participants: string[] = [];

    doc.participants.forEach((p: mongoose.Types.ObjectId | PopulatedParticipant) => {
      if (p && typeof p === 'object' && 'name' in p) {
        const populated = p as PopulatedParticipant;
        participants.push(String(populated._id));
        participantsData.push({
          _id: String(populated._id),
          name: populated.name,
        });
      } else if (p) {
        participants.push(String(p));
      }
    });

    const populatedDoc = doc as unknown as PopulatedConversation;

    return new Conversation(
      participants,
      participantsData.length > 0 ? participantsData : undefined,
      doc.lastMessage ? String(doc.lastMessage) : undefined,
      populatedDoc.lastMessage?.text,
      populatedDoc.lastMessage?.createdAt,
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
        const populatedDoc = doc as unknown as PopulatedConversation;
        const isAnyOtherBlocked = populatedDoc.participants.some(
          (p) => p && String(p._id) !== userId && p.isBlocked,
        );
        if (isAnyOtherBlocked) return null;

        const lastMsg = populatedDoc.lastMessage;

        if (
          lastMsg &&
          lastMsg.hiddenBy?.some((id) => String(id) === String(userId))
        ) {
          const actualLastMsg = await MessageModel.findOne({
            conversationId: doc._id,
            hiddenBy: { $ne: new mongoose.Types.ObjectId(userId) },
          }).sort({ createdAt: -1 });

          if (actualLastMsg) {
            populatedDoc.lastMessage = actualLastMsg;
          } else {
            populatedDoc.lastMessage = null;
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
