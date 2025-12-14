export interface IBaseRepository<Entity, ModelSchema> {
  create(entity: Entity): Promise<Entity>;
  findOneById(id: string): Promise<Entity | null>;
  findOneByField(filter: Partial<ModelSchema>): Promise<Entity | null>;
  findAllByField(filter: Partial<ModelSchema>): Promise<Entity[] | null>;
  updateOneById(
    id: string,
    entity: Partial<Entity>,
  ): Promise<Entity | null>;
  updateOneByField(
    filter: Partial<ModelSchema>,
    entity: Partial<Entity>,
  ): Promise<Entity | null>;
  updateAllByField(
    filter: Partial<ModelSchema>,
    entity: Partial<Entity>,
  ): Promise<void | boolean>;
  deleteOneById(id: string): Promise<void | boolean>;
  deleteOneByField(filter: Partial<ModelSchema>): Promise<void | boolean>;
}
