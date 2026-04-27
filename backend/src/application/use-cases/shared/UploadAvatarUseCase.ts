import { InternalServerError } from '~errors/HttpError';
import { ICloudService } from '~service-interfaces/ICloudService';
import { IImageGatewayService } from '~service-interfaces/IImageGatewayService';
import {
  IUploadAvatarUseCase,
  Prefix,
} from '~use-case-interfaces/shared/IFileUseCase';

/**
 * Use case to upload an avatar image from an external URL (e.g., Google Profile Picture).
 * Fetches the image buffer and uploads it to cloud storage.
 */
export class UploadAvatarUseCase implements IUploadAvatarUseCase {
  constructor(
    private _cloudService: ICloudService,
    private _imageGateway: IImageGatewayService,
  ) {}

  /**
   * Fetches an image from a URL and uploads it to the specified cloud path.
   * @param prefix The storage prefix (e.g., 'avatars/').
   * @param filename The desired filename.
   * @param imageUrl The source image URL.
   */
  async execute(
    prefix: Prefix,
    filename: string,
    imageUrl: string,
  ): Promise<void> {
    // Fetch the raw image data from the external source
    const { buffer, contentType } =
      await this._imageGateway.fetchImageBuffer(imageUrl);

    // Upload the buffer to cloud storage with a standard .jpeg extension
    const uploadResult = await this._cloudService.uploadBuffer(buffer, {
      key: `${prefix}${filename}.jpeg`,
      contentType,
    });

    if (!uploadResult.success)
      throw new InternalServerError(uploadResult.error);
  }
}
