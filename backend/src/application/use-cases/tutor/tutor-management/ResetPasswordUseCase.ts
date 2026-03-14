import { IResetPasswordUseCase } from '~use-case-interfaces/shared/IForgotPasswordUseCase';
import { ITutorRepository } from '~repository-interfaces/ITutorRepository';
import { IHashService } from '~service-interfaces/IHashService';
import { ITokenService } from '~service-interfaces/ITokenService';
import { Tutor } from '~entities/Tutor';

export class ResetPasswordUseCase implements IResetPasswordUseCase {
  constructor(
    private _tokenService: ITokenService,
    private _tutorRepo: ITutorRepository,
    private _hashService: IHashService,
  ) {}

  async execute(resetToken: string, password: string): Promise<void> {
    const payload = this._tokenService.verifyResetToken(resetToken);
    const email = payload.email;
    const hashedPassword = await this._hashService.hash(password);
    const tutor: Partial<Tutor> = {
      password: hashedPassword,
    };

    await this._tutorRepo.updateOneByField({ email }, tutor);
  }
}
