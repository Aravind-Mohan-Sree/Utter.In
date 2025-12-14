import { IGetEntityDataUseCase } from '~application-interfaces/user/IGetEntityDataUseCase';
import { IBaseRepository } from '~domain-repositories/IBaseRepository';

export class GetEntityDataUseCase<
  Entity,
  ModelSchema,
> implements IGetEntityDataUseCase<Entity> {
  constructor(private baseRepo: IBaseRepository<Entity, ModelSchema>) {}

  async getOneById(id: string): Promise<Entity | null> {
    const entity = await this.baseRepo.findOneById(id);

    if (!entity) return null;

    return entity;
  }
}
