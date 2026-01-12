import { IUser, UserModel } from '~models/UserModel';
import { BaseRepository } from './BaseRepository';
import { User } from '~entities/User';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { Document, PipelineStage } from 'mongoose';

export class UserRepository
  extends BaseRepository<User, IUser>
  implements IUserRepository
{
  constructor() {
    super(UserModel);
  }

  async fetchUsers(
    page: number,
    limit: number,
    query: string,
    filter: string,
  ): Promise<{
    totalUsersCount: number;
    filteredUsersCount: number;
    users: User[];
  }> {
    const pipeline: PipelineStage[] = [];
    const totalUsersCount = await this.model.countDocuments({});

    // Handle Status Filter
    if (filter !== 'All') {
      pipeline.push({
        $match: { isBlocked: filter === 'Blocked' },
      });
    }

    // Handle Search Query
    if (query) {
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
            {
              knownLanguages: { $elemMatch: { $regex: query, $options: 'i' } },
            },
          ],
        },
      });
    }

    // Fetch data and total count simultaneously
    pipeline.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [
          { $sort: { createdAt: -1, _id: 1 } },
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
      users: users.map(this.toEntity),
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
      doc.role,
      doc.isBlocked,
      String(doc._id),
      doc.createdAt,
      doc.updatedAt,
    );
  }
}
