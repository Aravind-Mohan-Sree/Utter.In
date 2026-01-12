import { errorMessage } from '~constants/errorMessage';
import { SigninDTO } from '~dtos/SigninDTO';
import { BadRequestError, NotFoundError } from '~errors/HttpError';
import { AdminMapper, AdminResponseDTO } from '~mappers/AdminMapper';
import { IAdminRepository } from '~repository-interfaces/IAdminRepository';
import { IHashService } from '~service-interfaces/IHashService';
import { ITokenService } from '~service-interfaces/ITokenService';
import { ISigninUseCase } from '~use-case-interfaces/admin/IAdminUseCase';

export class SigninUseCase implements ISigninUseCase {
  constructor(
    private adminRepo: IAdminRepository,
    private tokenService: ITokenService,
    private hashService: IHashService,
  ) {}

  async execute(data: SigninDTO): Promise<{
    admin: AdminResponseDTO;
    accessToken: string;
    refreshToken: string;
  }> {
    const { email, password } = data;
    const admin = await this.adminRepo.findOneByField({ email });

    if (!admin) throw new NotFoundError(errorMessage.ACCOUNT_NOT_EXISTS);

    const valid = await this.hashService.compare(password, admin.password!);

    if (!valid) throw new BadRequestError(errorMessage.WRONG_PASSWORD);

    const accessToken = this.tokenService.generateAuthToken({
      id: admin.id,
      role: 'admin',
    });
    const refreshToken = this.tokenService.generateRefreshToken({
      id: admin.id,
      role: 'admin',
    });

    return {
      admin: AdminMapper.toResponse(admin),
      accessToken,
      refreshToken,
    };
  }
}
