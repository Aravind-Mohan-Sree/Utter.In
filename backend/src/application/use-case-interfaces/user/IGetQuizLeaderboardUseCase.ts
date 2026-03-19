export interface IGetQuizLeaderboardUseCase {
  execute(page: number, limit: number): Promise<any[]>;
}
