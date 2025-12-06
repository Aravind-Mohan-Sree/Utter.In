import { Document, Model } from 'mongoose';
import { IBaseRepository } from '~domain-repositories/IBaseRepository';

export abstract class BaseRepository<Entity, ModelSchema> implements IBaseRepository<Entity> {
  constructor(protected model: Model<ModelSchema & Document>) {}

  async create(data: Entity | ModelSchema): Promise<Entity | null> {
    const doc = await this.model.create(data);

    if (!doc) return null;

    return this.toEntity(doc) as Entity;
  }

  protected abstract toEntity(data: ModelSchema & Document | null): Entity | null;
}
