import { IUser, UserModel } from '~models/UserModel';
import { BaseRepository } from './BaseRepository';
import { User } from '~entities/User';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { FilterQuery } from '~repository-interfaces/IBaseRepository';
import { Document, PipelineStage, Types } from 'mongoose';

/**
 * Concrete repository for User entities using Mongoose.
 * Handles data persistence and complex aggregation queries for user listings.
 */
export class UserRepository
  extends BaseRepository<User, IUser>
  implements IUserRepository {
  constructor() {
    super(UserModel);
  }

  /**
   * Fetches users with pagination, search, and filtering logic.
   * Supports both admin and public-facing listing requirements.
   * 
   * @param page Current page number.
   * @param limit Records per page.
   * @param query Search string (names, emails, languages).
   * @param filter Block status filter (for admins).
   * @param sort Sorting criteria (newest, oldest, a-z, z-a).
   * @param language Specific language filter.
   * @param excludeId Optional ID to exclude from results (e.g., current user).
   * @param isAdmin Flag to bypass "blocked" filter and show admin-only data.
   */
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
    
    // Default base query: only include 'user' role
    const queryObj: Record<string, unknown> = { role: 'user' };

    // Public view only shows non-blocked users
    if (!isAdmin) {
      queryObj.isBlocked = false;
    }

    // Exclude specific user if provided
    if (excludeId && Types.ObjectId.isValid(excludeId)) {
      queryObj._id = { $ne: new Types.ObjectId(excludeId) };
    } else if (excludeId) {
      queryObj._id = { $ne: excludeId };
    }
    
    // Count total users matching the base role filter
    const totalUsersCount = await this.model.countDocuments(queryObj as FilterQuery<IUser>);
    
    pipeline.push({ $match: queryObj });

    // Apply admin-specific status filter
    if (isAdmin && filter !== 'All') {
      pipeline.push({
        $match: { isBlocked: filter === 'Blocked' },
      });
    }

    // Filter by specific language if requested
    if (language !== 'All') {
      pipeline.push({
        $match: { knownLanguages: language },
      });
    }
    
    // Apply text search across multiple fields
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

    // Configure sorting
    let sortStage: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === 'oldest') sortStage = { createdAt: 1 };
    else if (sort === 'a-z') sortStage = { name: 1 };
    else if (sort === 'z-a') sortStage = { name: -1 };
    
    // Use $facet to get both data and the count of filtered records in one query
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

  /**
   * Internal mapper to convert domain entity to Mongoose schema object.
   */
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

  /**
   * Internal mapper to convert Mongoose document to domain entity.
   */
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

  /**
   * Helper to get most recently registered users.
   */
  getRecentUsers = async (limit: number): Promise<User[]> => {
    const docs = await this.model.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(limit);
    return docs.map((doc) => this.toEntity(doc as IUser & Document<unknown>)!);
  };
}
