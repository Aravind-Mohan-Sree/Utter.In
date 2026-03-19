import { IUser, UserModel } from '~models/UserModel';
import { BaseRepository } from './BaseRepository';
import { User } from '~entities/User';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { FilterQuery } from '~repository-interfaces/IBaseRepository';
import { Document, PipelineStage, Types } from 'mongoose';

export class UserRepository
  extends BaseRepository<User, IUser>
  implements IUserRepository {
  constructor() {
    super(UserModel);
  }

  async fetchUsers(
    page: number,
    limit: number,
    query: string,
    filter: string,
    sort = 'newest',
    language = 'All',
    excludeId?: string,
    isAdmin = false,
  ): Promise<{
    totalUsersCount: number;
    filteredUsersCount: number;
    users: User[];
  }> {
    const pipeline: PipelineStage[] = [];
    
    const queryObj: Record<string, unknown> = { role: 'user' };

    if (!isAdmin) {
      queryObj.isBlocked = false;
    }

    if (excludeId && Types.ObjectId.isValid(excludeId)) {
      queryObj._id = { $ne: new Types.ObjectId(excludeId) };
    } else if (excludeId) {
      queryObj._id = { $ne: excludeId };
    }
    
    const totalUsersCount = await this.model.countDocuments(queryObj as FilterQuery<IUser>);
    
    pipeline.push({ $match: queryObj });

    if (isAdmin && filter !== 'All') {
      pipeline.push({
        $match: { isBlocked: filter === 'Blocked' },
      });
    }

    if (language !== 'All') {
      pipeline.push({
        $match: { knownLanguages: language },
      });
    }
    
    if (query) {
      const orConditions: Record<string, unknown>[] = [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { knownLanguages: { $elemMatch: { $regex: query, $options: 'i' } } },
      ];

      if (Types.ObjectId.isValid(query)) {
        orConditions.push({ _id: new Types.ObjectId(query) });
      }

      pipeline.push({
        $match: {
          $or: orConditions,
        },
      });
    }

    let sortStage: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === 'oldest') sortStage = { createdAt: 1 };
    else if (sort === 'a-z') sortStage = { name: 1 };
    else if (sort === 'z-a') sortStage = { name: -1 };
    
    pipeline.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [
          { $sort: sortStage },
          { $skip: (page - 1) * limit },
          { $limit: limit },
        ],
      },
    });

    const result = await this.model.aggregate(pipeline);
    const users = result[0].data;
    const filteredUsersCount = result[0].metadata[0]?.total || 0;

    return {
      totalUsersCount,
      filteredUsersCount,
      users: users.map((u: IUser & Document) => this.toEntity(u)!),
    };
  }

  protected toSchema(entity: User | Partial<User>): IUser | Partial<IUser> {
    return {
      name: entity.name,
      email: entity.email,
      knownLanguages: entity.knownLanguages,
      bio: entity.bio,
      password: entity.password,
      role: entity.role,
      isBlocked: entity.isBlocked,
      googleId: entity.googleId!,
      streak: entity.streak!,
      quizStats: entity.quizStats!,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  protected toEntity(doc: (IUser & Document<unknown>) | null): User | null {
    if (!doc) return null;

    return new User(
      doc.name,
      doc.email,
      doc.knownLanguages,
      doc.bio,
      doc.password,
      doc.googleId,
      doc.streak,
      doc.quizStats,
      doc.role,
      doc.isBlocked,
      String(doc._id),
      doc.createdAt,
      doc.updatedAt,
    );
  }
}
