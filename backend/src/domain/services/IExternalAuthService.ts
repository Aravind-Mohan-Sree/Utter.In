import { IGoogleAuthUseCase } from '~application-interfaces/use-cases/IGoogleAuthUseCase';

export interface IExternalAuthService {
  initializeStrategy(useCase: IGoogleAuthUseCase): void;
}
