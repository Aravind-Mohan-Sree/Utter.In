import { InternalServerError } from '~errors/HttpError';
import { ICloudService } from '~service-interfaces/ICloudService';
import { IImageGatewayService } from '~service-interfaces/IImageGatewayService';
import {
  IUploadAvatarUseCase,
  Prefix,
} from '~use-case-interfaces/shared/IFileUseCase';

export class UploadAvatarUseCase implements IUploadAvatarUseCase {
  constructor(
    private cloudService: ICloudService,
    private imageGateway: IImageGatewayService,
  ) {}

  async execute(
    prefix: Prefix,
    filename: string,
    imageUrl: string,
  ): Promise<void> {
    const { buffer, contentType } =
      await this.imageGateway.fetchImageBuffer(imageUrl);

    const uploadResult = await this.cloudService.uploadBuffer(buffer, {
      key: `${prefix}${filename}.jpeg`,
      contentType,
    });

    if (!uploadResult.success)
      throw new InternalServerError(uploadResult.error);
  }
}
