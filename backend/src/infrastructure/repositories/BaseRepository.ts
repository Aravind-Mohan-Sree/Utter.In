import mongoose, { Document, Model, UpdateQuery } from 'mongoose';
import { IBaseRepository, FilterQuery } from '~repository-interfaces/IBaseRepository';

/**
 * Abstract base class for all repositories in the application.
 * Provides standard CRUD operations using Mongoose and handles entity-to-schema conversion.
 * 
 * @template Entity The domain entity type.
 * @template ModelSchema The Mongoose schema/model type.
 */
export abstract class BaseRepository<
  Entity,
  ModelSchema,
> implements IBaseRepository<Entity, ModelSchema> {
  constructor(protected model: Model<ModelSchema & Document>) { }

  /**
   * Persists a new entity to the database.
   * @param entity The domain entity to save.
   * @returns The created entity with its database-generated fields (like ID).
   */
  async create(entity: Entity): Promise<Entity> {
    const schemaData = this.toSchema(entity);
    const newDoc = new this.model(schemaData);
    const doc = await newDoc.save();
    return this.toEntity(doc) as Entity;
  }

  /**
   * Finds a single record by its unique ID.
   * @param id The record's ID.
   * @returns The domain entity or null if not found.
   */
  async findOneById(id: string): Promise<Entity | null> {
    const doc = await this.model.findById(id);

    if (!doc) return null;

    return this.toEntity(doc);
  }

  /**
   * Finds a single record based on a specific filter.
   * @param filter Mongoose filter query.
   * @returns The first matching domain entity or null.
   */
  async findOneByField(filter: FilterQuery<ModelSchema>): Promise<Entity | null> {
    const doc = await this.model.findOne(filter as FilterQuery<ModelSchema & Document>);

    if (!doc) return null;

    return this.toEntity(doc);
  }

  /**
   * Finds all records matching a filter with optional pagination.
   * @param filter Mongoose filter query.
   * @param options Pagination options (skip, limit).
   * @returns Array of domain entities or null if empty.
   */
  async findAllByField(
    filter: FilterQuery<ModelSchema>,
    options?: { skip?: number; limit?: number },
  ): Promise<Entity[] | null> {
    let query = this.model.find(
      filter as FilterQuery<ModelSchema & Document>,
    );

    if (options?.skip !== undefined) query = query.skip(options.skip);
    if (options?.limit !== undefined) query = query.limit(options.limit);

    const docs = await query;

    if (docs.length === 0) return null;

    return docs.map((doc) => this.toEntity(doc as ModelSchema & Document)) as Entity[];
  }

  /**
   * Updates a record by ID.
   * @param id The record's ID.
   * @param entity Partial domain entity containing update data.
   * @returns The updated domain entity.
   */
  async updateOneById(
    id: string,
    entity: Partial<Entity>,
  ): Promise<Entity | null> {
    const schemaData = this.toSchema(entity);
    const doc = await this.model.findByIdAndUpdate(
      id,
      {
        $set: schemaData,
      } as UpdateQuery<ModelSchema & Document>,
      { new: true },
    );

    return this.toEntity(doc);
  }

  /**
   * Updates the first record that matches a filter.
   * @param filter Mongoose filter query.
   * @param entity Update data.
   * @returns The updated domain entity.
   */
  async updateOneByField(
    filter: FilterQuery<ModelSchema>,
    entity: Partial<Entity>,
  ): Promise<Entity | null> {
    const schemaData = this.toSchema(entity);
    const doc = await this.model.findOneAndUpdate(
      filter as NonNullable<FilterQuery<ModelSchema & Document>>,
      {
        $set: schemaData,
      } as UpdateQuery<ModelSchema & Document>,
      { new: true },
    );

    return this.toEntity(doc);
  }

  /**
   * Updates all records matching a filter.
   * @returns Boolean indicating if the operation was acknowledged.
   */
  async updateAllByField(
    filter: FilterQuery<ModelSchema>,
    entity: Partial<Entity>,
  ): Promise<boolean> {
    const schemaData = this.toSchema(entity);

    const result = await this.model.updateMany(filter as NonNullable<FilterQuery<ModelSchema & Document>>, {
      $set: schemaData,
    } as UpdateQuery<ModelSchema & Document>);

    return result.acknowledged;
  }

  /**
   * Deletes all records matching a filter.
   */
  async delete(filter: FilterQuery<ModelSchema>): Promise<void | boolean> {
    const result = await this.model.deleteMany(filter as NonNullable<FilterQuery<ModelSchema & Document>>);

    return result.acknowledged;
  }

  /**
   * Deletes a single record by its ID.
   */
  async deleteOneById(id: string): Promise<void | boolean> {
    const result = await this.model.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
    } as FilterQuery<ModelSchema & Document>);

    return result.acknowledged;
  }

  /**
   * Deletes a single record matching a filter.
   */
  async deleteOneByField(
    filter: FilterQuery<ModelSchema>,
  ): Promise<void | boolean> {
    const result = await this.model.deleteOne(filter as NonNullable<FilterQuery<ModelSchema & Document>>);

    return result.acknowledged;
  }

  /**
   * Counts the total number of records matching a filter.
   */
  async countRecords(filter: FilterQuery<ModelSchema>): Promise<number> {
    return this.model.countDocuments(filter as NonNullable<FilterQuery<ModelSchema & Document>>);
  }

  /**
   * Maps a domain entity to a Mongoose-compatible schema object.
   */
  protected abstract toSchema(
    entity: Entity | Partial<Entity>,
  ): ModelSchema | Partial<ModelSchema>;

  /**
   * Maps a Mongoose document to a domain entity.
   */
  protected abstract toEntity(
    data: (ModelSchema & Document) | null,
  ): Entity | null;
}
