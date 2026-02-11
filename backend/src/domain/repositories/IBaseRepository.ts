import { Model } from 'mongoose';

export type FilterQuery<T> = Parameters<Model<T>['find']>[0];

export interface IBaseRepository<Entity, ModelSchema> {
  create(entity: Entity): Promise<Entity>;
  findOneById(id: string): Promise<Entity | null>;
  findOneByField(filter: FilterQuery<ModelSchema>): Promise<Entity | null>;
  findAllByField(filter: FilterQuery<ModelSchema>): Promise<Entity[] | null>;
  updateOneById(
    id: string,
    entity: Partial<Entity>,
  ): Promise<Entity | null>;
  updateOneByField(
    filter: FilterQuery<ModelSchema>,
    entity: Partial<Entity>,
  ): Promise<Entity | null>;
  updateAllByField(
    filter: FilterQuery<ModelSchema>,
    entity: Partial<Entity>,
  ): Promise<void | boolean>;
  deleteOneById(id: string): Promise<void | boolean>;
  deleteOneByField(filter: FilterQuery<ModelSchema>): Promise<void | boolean>;
}
