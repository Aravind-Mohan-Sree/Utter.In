export interface ICreateEntityUseCase<T> {
  execute(data: Partial<T>): Promise<T>;
}
