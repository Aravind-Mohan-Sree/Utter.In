import { DashboardDataResponseDTO } from '~dtos/DashboardDTO';

export interface IGetDashboardDataUseCase {
    execute(): Promise<DashboardDataResponseDTO>;
}
