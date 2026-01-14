import { ChangePasswordDTO } from '~dtos/ChangePasswordDTO';
import { RegisterTutorDTO } from '~dtos/RegisterTutorDTO';
import { SigninDTO } from '~dtos/SigninDTO';
import { TutorProfileUpdateDTO } from '~dtos/TutorProfileUpdateDTO';
import { TutorResponseDTO } from '~mappers/TutorMapper';

export interface IRegisterTutorUseCase {
  execute(data: RegisterTutorDTO): Promise<string>;
}

export interface IUploadTutorFilesUseCase {
  execute(
    email: string,
    introVideoPath: string,
    certificatePath: string,
  ): Promise<void>;
}

export interface IUpdateTutorFilesUseCase {
  execute(oldId: string, newId: string): Promise<void>;
}

export interface IDeleteTutorFilesUseCase {
  execute(id: string): Promise<void>;
}

export interface IRegisterTutorFromPendingUseCase {
  execute(email: string): Promise<{
    pendingTutorId: string;
    newTutorId: string;
    tutor: TutorResponseDTO;
  }>;
}

export interface ITutorGoogleRegisterUseCase {
  execute(
    name: string,
    email: string,
  ): Promise<void>;
}

export interface ITutorGoogleSigninUseCase {
  execute(
    email: string,
    googleId: string,
  ): Promise<{
    tutor: TutorResponseDTO;
    accessToken: string;
    refreshToken: string;
  }>;
}

export interface ISigninTutorUseCase {
  execute(data: SigninDTO): Promise<{
    tutor: TutorResponseDTO;
    accessToken: string;
    refreshToken: string;
  }>;
}

export interface IGetDataUseCase {
  execute(email: string): Promise<TutorResponseDTO>;
}

export interface IUpdateProfileUseCase {
  execute(id: string, data: TutorProfileUpdateDTO): Promise<TutorResponseDTO>;
}

export interface IChangePasswordUseCase {
  execute(id: string, data: ChangePasswordDTO): Promise<void>;
}
