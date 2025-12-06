import { ICreateEntityUseCase } from '~application-interfaces/use-cases/ICreateEntityUseCase';
import { IBaseRepository } from '~domain-repositories/IBaseRepository';

export class CreateEntityUseCase<T> implements ICreateEntityUseCase<T> {
  constructor(private repository: IBaseRepository<T>) {}

  async execute(data: Partial<T>): Promise<T> {
    const entity = await this.repository.create(data);

    return entity;
  }
}
