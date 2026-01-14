import { ChangePasswordDTO } from '~dtos/ChangePasswordDTO';
import { RegisterUserDTO } from '~dtos/RegisterUserDTO';
import { SigninDTO } from '~dtos/SigninDTO';
import { UserProfileUpdateDTO } from '~dtos/UserProfileUpdateDTO';
import { UserResponseDTO } from '~mappers/UserMapper';

export interface IRegisterUserUseCase {
  execute(data: RegisterUserDTO): Promise<string>;
}

export interface IRegisterUserFromPendingUseCase {
  execute(email: string): Promise<UserResponseDTO>;
}

export interface IUserGoogleRegisterUseCase {
  execute(
    email: string,
    googleId: string,
  ): Promise<{
    user: UserResponseDTO;
    accessToken: string;
    refreshToken: string;
  }>;
}

export interface ISigninUserUseCase {
  execute(data: SigninDTO): Promise<{
    user: UserResponseDTO;
    accessToken: string;
    refreshToken: string;
  }>;
}

export interface IGetDataUseCase {
  execute(email: string): Promise<UserResponseDTO>;
}

export interface IUpdateProfileUseCase {
  execute(id: string, data: UserProfileUpdateDTO): Promise<UserResponseDTO>;
}

export interface IChangePasswordUseCase {
  execute(id: string, data: ChangePasswordDTO): Promise<void>;
}
