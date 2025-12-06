export interface IBaseRepository<Entity> {
  create(data: Entity): Promise<Entity | null>;
}
