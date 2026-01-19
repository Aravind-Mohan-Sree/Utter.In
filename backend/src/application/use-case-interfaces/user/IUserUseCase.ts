import { ChangePasswordDTO } from '~dtos/ChangePasswordDTO';
import { FinishRegisterUserDTO } from '~dtos/FinishRegisterUserDTO';
import { RegisterUserDTO } from '~dtos/RegisterUserDTO';
import { SigninDTO } from '~dtos/SigninDTO';
import { UserProfileUpdateDTO } from '~dtos/UserProfileUpdateDTO';
import { UserResponseDTO } from '~mappers/UserMapper';

export interface IRegisterUserUseCase {
  execute(data: RegisterUserDTO): Promise<string>;
}

export interface IFinishRegisterUserUseCase {
  execute(data: FinishRegisterUserDTO): Promise<{
    oldId: string;
    user: UserResponseDTO;
    accessToken: string;
    refreshToken: string;
  }>;
}

export interface IRegisterUserFromPendingUseCase {
  execute(email: string): Promise<UserResponseDTO>;
}

export interface IUserGoogleRegisterUseCase {
  execute(name: string, email: string): Promise<string>;
}

export interface IUserGoogleSigninUseCase {
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
  execute(email: string): Promise<UserResponseDTO | null>;
}

export interface IUpdateProfileUseCase {
  execute(id: string, data: UserProfileUpdateDTO): Promise<UserResponseDTO>;
}

export interface IChangePasswordUseCase {
  execute(id: string, data: ChangePasswordDTO): Promise<void>;
}
