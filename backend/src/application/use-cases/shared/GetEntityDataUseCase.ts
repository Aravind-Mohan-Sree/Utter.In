import { IGetEntityDataUseCase } from '~use-case-interfaces/shared/IGetEntityDataUseCase';
import { IBaseRepository } from '~repository-interfaces/IBaseRepository';

export class GetEntityDataUseCase<
  Entity,
  ModelSchema,
> implements IGetEntityDataUseCase<Entity> {
  constructor(private _baseRepo: IBaseRepository<Entity, ModelSchema>) {}

  async getOneById(id: string): Promise<Entity | null> {
    const entity = await this._baseRepo.findOneById(id);

    if (!entity) return null;

    return entity;
  }
}
