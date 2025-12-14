import { RegisterUserDTO } from '~/application/dtos/RegisterUserDTO';
import { SigninUserDTO } from '~/application/dtos/SigninUserDTO';
import { User } from '~entities/User';

export interface IRegisterUserUseCase {
  execute(data: RegisterUserDTO): Promise<string>;
}

export interface IRegisterUserFromPendingUseCase {
  execute(email: string): Promise<Partial<User>>;
}

export interface IGoogleAuthUseCase {
  execute(
    email: string,
    googleId: string,
  ): Promise<{
    user: Partial<User>;
    accessToken: string;
    refreshToken: string;
  }>;
}

export interface ISigninUserUseCase {
  execute(data: SigninUserDTO): Promise<{
    user: Partial<User>;
    accessToken: string;
    refreshToken: string;
  }>;
}
