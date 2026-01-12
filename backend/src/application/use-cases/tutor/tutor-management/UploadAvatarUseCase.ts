import { unlink } from 'fs/promises';
import { InternalServerError } from '~errors/HttpError';
import { IS3Service } from '~service-interfaces/ICloudService';
import { IUploadAvatarUseCase } from '~use-case-interfaces/shared/IAvatarUseCase';

export class UploadAvatarUseCase implements IUploadAvatarUseCase {
  constructor(private cloudService: IS3Service) {}

  async execute(id: string, avatarPath: string): Promise<void> {
    const avatarUploadResult = await this.cloudService.upload(avatarPath, {
      key: `tutors/avatars/${id}.jpeg`,
      contentType: 'image/jpeg',
    });

    if (!avatarUploadResult.success) {
      throw new InternalServerError(avatarUploadResult.error);
    }

    await unlink(avatarPath);
  }
}
