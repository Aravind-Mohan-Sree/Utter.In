import { IResetPasswordUseCase } from '~use-case-interfaces/shared/IForgotPasswordUseCase';
import { IUserRepository } from '~repository-interfaces/IUserRepository';
import { IHashService } from '~service-interfaces/IHashService';
import { ITokenService } from '~service-interfaces/ITokenService';
import { User } from '~entities/User';

export class ResetPasswordUseCase implements IResetPasswordUseCase {
  constructor(
    private tokenService: ITokenService,
    private userRepo: IUserRepository,
    private hashService: IHashService,
  ) {}

  async execute(resetToken: string, password: string): Promise<void> {
    const payload = this.tokenService.verifyResetToken(resetToken);
    const email = payload.email;
    const hashedPassword = await this.hashService.hash(password);
    const user: Partial<User> = {
      password: hashedPassword,
    };

    await this.userRepo.updateOneByField({ email }, user);
  }
}
