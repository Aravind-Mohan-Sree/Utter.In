export interface IGetEntityDataUseCase<Entity> {
  getOneById(id: string): Promise<Entity | null>;
}
