import { RegisterTutorDTO } from '~dtos/RegisterTutorDTO';
import { SigninDTO } from '~dtos/SigninDTO';
import { Tutor } from '~entities/Tutor';

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
    tutor: Partial<Tutor>;
  }>;
}

export interface ITutorGoogleAuthUseCase {
  execute(
    email: string,
    googleId: string,
  ): Promise<{
    tutor: Partial<Tutor>;
    accessToken: string;
    refreshToken: string;
  }>;
}

export interface ISigninTutorUseCase {
  execute(data: SigninDTO): Promise<{
    tutor: Partial<Tutor>;
    accessToken: string;
    refreshToken: string;
  }>;
}

export interface IGetDataUseCase {
  execute(email: string): Promise<Partial<Tutor>>;
}
