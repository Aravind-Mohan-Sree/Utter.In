import { unlink } from 'fs/promises';
import { InternalServerError } from '~errors/HttpError';
import { ICloudService } from '~service-interfaces/ICloudService';
import {
  ContentType,
  IUploadChatAttachmentUseCase,
  Prefix,
} from '~use-case-interfaces/shared/IFileUseCase';

/**
 * Use case to upload a file attachment for a chat message.
 * Uploads a local temporary file to cloud storage and cleans up the local file.
 */
export class UploadChatAttachmentUseCase implements IUploadChatAttachmentUseCase {
  constructor(private _cloudService: ICloudService) { }

  /**
   * Uploads an attachment to the cloud and returns its storage key (URL).
   * @param prefix The storage category prefix.
   * @param filename Original name of the file.
   * @param filepath Local path to the temporary file.
   * @param contentType MIME type of the file.
   * @returns The cloud storage key/URL.
   */
  async execute(
    prefix: Prefix,
    filename: string,
    filepath: string,
    contentType: ContentType,
  ): Promise<string> {
    // Perform the upload to the cloud provider
    const uploadResult = await this._cloudService.upload(filepath, {
      key: `${prefix}${Date.now()}-${filename}`,
      contentType,
    });

    if (!uploadResult.success || !uploadResult.data) {
      throw new InternalServerError(uploadResult.error || 'Failed to upload chat attachment');
    }

    // Clean up the temporary local file asynchronously
    await unlink(filepath).catch(() => void 0);

    return uploadResult.data.key;
  }
}
