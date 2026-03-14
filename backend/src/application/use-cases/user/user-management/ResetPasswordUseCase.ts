import { IResetPasswordUseCase } from '~use-case-interfaces/shared/IForgotPasswordUseCase';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { IHashService } from '~service-interfaces/IHashService';
import { ITokenService } from '~service-interfaces/ITokenService';
import { User } from '~entities/User';

export class ResetPasswordUseCase implements IResetPasswordUseCase {
  constructor(
    private _tokenService: ITokenService,
    private _userRepo: IUserRepository,
    private _hashService: IHashService,
  ) {}

  async execute(resetToken: string, password: string): Promise<void> {
    const payload = this._tokenService.verifyResetToken(resetToken);
    const email = payload.email;
    const hashedPassword = await this._hashService.hash(password);
    const user: Partial<User> = {
      password: hashedPassword,
    };

    await this._userRepo.updateOneByField({ email }, user);
  }
}
