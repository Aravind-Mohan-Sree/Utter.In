import { RegisterUserDTO } from '~dtos/RegisterUserDTO';
import { SigninDTO } from '~dtos/SigninDTO';
import { User } from '~entities/User';

export interface IRegisterUserUseCase {
  execute(data: RegisterUserDTO): Promise<string>;
}

export interface IRegisterUserFromPendingUseCase {
  execute(email: string): Promise<Partial<User>>;
}

export interface IUserGoogleAuthUseCase {
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
  execute(data: SigninDTO): Promise<{
    user: Partial<User>;
    accessToken: string;
    refreshToken: string;
  }>;
}
