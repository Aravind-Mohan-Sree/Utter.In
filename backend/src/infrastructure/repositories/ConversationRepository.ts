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

/**
 * Concrete repository for Conversation entities using Mongoose.
 * Manages chat sessions, unread counts, and participant population.
 */
export class ConversationRepository
  extends BaseRepository<Conversation, IConversation>
  implements IConversationRepository
{
  constructor() {
    super(ConversationModel);
  }

  /**
   * Internal mapper to convert domain entity to Mongoose schema object.
   * Transforms the unreadCount map and participant IDs.
   */
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

  /**
   * Internal mapper to convert Mongoose document to domain entity.
   * Handles populated participants and formatting the last message preview.
   */
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
      populatedDoc.lastMessage?.text || (populatedDoc.lastMessage?.fileUrl ? (populatedDoc.lastMessage.fileType?.startsWith('image/') ? 'Photo' : populatedDoc.lastMessage.fileType?.startsWith('video/') ? 'Video' : 'File') : undefined),
      populatedDoc.lastMessage?.createdAt,
      unreadCountObj,
      String(doc._id),
      doc.createdAt,
      doc.updatedAt,
    );
  }

  /**
   * Finds a conversation involving a specific set of participants.
   */
  async findByParticipants(participants: string[]): Promise<Conversation | null> {
    const sortedParticipants = [...participants].sort();
    const doc = await ConversationModel.findOne({
      participants: { $all: sortedParticipants, $size: sortedParticipants.length },
    });
    return this.toEntity(doc);
  }

  /**
   * Retrieves all active conversations for a user.
   * Filters out blocked users and calculates the "real" last message if some messages are hidden.
   */
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
        
        // Skip conversation if the other participant is blocked
        const isAnyOtherBlocked = populatedDoc.participants.some(
          (p) => p && String(p._id) !== userId && p.isBlocked,
        );
        if (isAnyOtherBlocked) return null;

        const lastMsg = populatedDoc.lastMessage;

        // If the last message was hidden by this user, find the previous one that isn't hidden
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

  /**
   * Clears the unread count for a specific participant in a conversation.
   */
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
