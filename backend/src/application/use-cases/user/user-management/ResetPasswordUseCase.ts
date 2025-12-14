import { IResetPasswordUseCase } from '~application-interfaces/user/IForgotPasswordUseCase';
import { IUserRepository } from '~domain-repositories/IUserRepository';
import { IHashService } from '~domain-services/IHashService';
import { ITokenService } from '~domain-services/ITokenService';
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
