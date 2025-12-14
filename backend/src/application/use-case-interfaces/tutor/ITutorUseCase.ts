import { RegisterTutorDTO } from "~dtos/RegisterTutorDTO";
import { SigninDTO } from "~dtos/SigninDTO";
import { Tutor } from "~entities/Tutor";

export interface IRegisterTutorUseCase {
  execute(data: RegisterTutorDTO): Promise<string>;
}

export interface IRegisterTutorFromPendingUseCase {
  execute(email: string): Promise<Partial<Tutor>>;
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
