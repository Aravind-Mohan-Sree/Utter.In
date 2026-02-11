import mongoose, { Document, Model, UpdateQuery } from 'mongoose';
import { IBaseRepository, FilterQuery } from '~repository-interfaces/IBaseRepository';

export abstract class BaseRepository<
  Entity,
  ModelSchema,
> implements IBaseRepository<Entity, ModelSchema> {
  constructor(protected model: Model<ModelSchema & Document>) { }

  async create(entity: Entity): Promise<Entity> {
    const schemaData = this.toSchema(entity);
    const newDoc = new this.model(schemaData);
    const doc = await newDoc.save();
    return this.toEntity(doc) as Entity;
  }

  async findOneById(id: string): Promise<Entity | null> {
    const doc = await this.model.findById(id);

    if (!doc) return null;

    return this.toEntity(doc);
  }

  async findOneByField(filter: FilterQuery<ModelSchema>): Promise<Entity | null> {
    const doc = await this.model.findOne(filter as FilterQuery<ModelSchema & Document>);

    if (!doc) return null;

    return this.toEntity(doc);
  }

  async findAllByField(filter: FilterQuery<ModelSchema>): Promise<Entity[] | null> {
    const docs = await this.model.find(filter as FilterQuery<ModelSchema & Document>);

    if (docs.length === 0) return null;

    return docs.map(this.toEntity) as Entity[];
  }

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

  async delete(filter: FilterQuery<ModelSchema>): Promise<void | boolean> {
    const result = await this.model.deleteMany(filter as NonNullable<FilterQuery<ModelSchema & Document>>);

    return result.acknowledged;
  }

  async deleteOneById(id: string): Promise<void | boolean> {
    const result = await this.model.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
    } as FilterQuery<ModelSchema & Document>);

    return result.acknowledged;
  }

  async deleteOneByField(
    filter: FilterQuery<ModelSchema>,
  ): Promise<void | boolean> {
    const result = await this.model.deleteOne(filter as NonNullable<FilterQuery<ModelSchema & Document>>);

    return result.acknowledged;
  }

  protected abstract toSchema(
    entity: Entity | Partial<Entity>,
  ): ModelSchema | Partial<ModelSchema>;

  protected abstract toEntity(
    data: (ModelSchema & Document) | null,
  ): Entity | null;
}
