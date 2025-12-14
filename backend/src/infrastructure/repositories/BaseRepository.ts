import mongoose, { Document, Model, UpdateQuery } from 'mongoose';
import { IBaseRepository } from '~repository-interfaces/IBaseRepository';

export abstract class BaseRepository<
  Entity,
  ModelSchema,
> implements IBaseRepository<Entity, ModelSchema> {
  constructor(protected model: Model<ModelSchema & Document>) {}

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

  async findOneByField(filter: Partial<ModelSchema>): Promise<Entity | null> {
    const doc = await this.model.findOne(filter);

    if (!doc) return null;

    return this.toEntity(doc);
  }

  async findAllByField(filter: Partial<ModelSchema>): Promise<Entity[] | null> {
    const docs = await this.model.find(filter);

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
      } as UpdateQuery<Partial<ModelSchema> & Document>,
      { new: true },
    );

    return this.toEntity(doc);
  }

  async updateOneByField(
    filter: Partial<ModelSchema>,
    entity: Partial<Entity>,
  ): Promise<Entity | null> {
    const schemaData = this.toSchema(entity);
    const doc = await this.model.findOneAndUpdate(
      filter,
      {
        $set: schemaData,
      } as UpdateQuery<Partial<ModelSchema> & Document>,
      { new: true },
    );

    return this.toEntity(doc);
  }

  async updateAllByField(
    filter: Partial<ModelSchema>,
    entity: Partial<Entity>,
  ): Promise<boolean> {
    const schemaData = this.toSchema(entity);

    const result = await this.model.updateMany(filter, {
      $set: schemaData,
    } as UpdateQuery<Partial<ModelSchema> & Document>);

    return result.acknowledged;
  }

  async delete(filter: Partial<ModelSchema>): Promise<void | boolean> {
    const result = await this.model.deleteMany(filter);

    return result.acknowledged;
  }

  async deleteOneById(id: string): Promise<void | boolean> {
    const result = await this.model.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
    });

    return result.acknowledged;
  }

  async deleteOneByField(
    filter: Partial<ModelSchema>,
  ): Promise<void | boolean> {
    const result = await this.model.deleteOne(filter);

    return result.acknowledged;
  }

  protected abstract toSchema(
    entity: Entity | Partial<Entity>,
  ): ModelSchema | Partial<ModelSchema>;

  protected abstract toEntity(
    data: (ModelSchema & Document) | null,
  ): Entity | null;
}
