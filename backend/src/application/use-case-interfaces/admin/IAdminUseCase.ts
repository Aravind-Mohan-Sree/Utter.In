import { SigninDTO } from '~dtos/SigninDTO';
import { AdminResponseDTO } from '~mappers/AdminMapper';

export interface ISigninUseCase {
  execute(data: SigninDTO): Promise<{
    admin: AdminResponseDTO;
    accessToken: string;
    refreshToken: string;
  }>;
}
