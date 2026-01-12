import { InternalServerError } from '~errors/HttpError';
import { IS3Service } from '~service-interfaces/ICloudService';
import { IDeleteAvatarUseCase } from '~use-case-interfaces/shared/IAvatarUseCase';

export class DeleteAvatarUseCase implements IDeleteAvatarUseCase {
  constructor(private cloudService: IS3Service) {}

  async execute(id: string): Promise<void> {
    const avatarDeleteResult = await this.cloudService.delete(
      `users/avatars/${id}.jpeg`,
    );

    if (!avatarDeleteResult.success) {
      throw new InternalServerError(avatarDeleteResult.error);
    }
  }
}
