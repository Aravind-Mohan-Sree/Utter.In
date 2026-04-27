import { IGetEntityDataUseCase } from '~use-case-interfaces/shared/IGetEntityDataUseCase';
import { IBaseRepository } from '~repository-interfaces/IBaseRepository';

/**
 * Generic use case to retrieve a single entity by its unique ID.
 * Works with any entity type that follows the base repository pattern.
 */
export class GetEntityDataUseCase<
  Entity,
  ModelSchema,
> implements IGetEntityDataUseCase<Entity> {
  constructor(private _baseRepo: IBaseRepository<Entity, ModelSchema>) {}

  /**
   * Fetches an entity by ID from the appropriate repository.
   * @param id The unique identifier of the entity.
   * @returns The entity or null if not found.
   */
  async getOneById(id: string): Promise<Entity | null> {
    const entity = await this._baseRepo.findOneById(id);

    if (!entity) return null;

    return entity;
  }
}
