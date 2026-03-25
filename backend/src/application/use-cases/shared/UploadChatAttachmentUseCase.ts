import { unlink } from 'fs/promises';
import { InternalServerError } from '~errors/HttpError';
import { ICloudService } from '~service-interfaces/ICloudService';
import {
  ContentType,
  IUploadChatAttachmentUseCase,
  Prefix,
} from '~use-case-interfaces/shared/IFileUseCase';

export class UploadChatAttachmentUseCase implements IUploadChatAttachmentUseCase {
  constructor(private _cloudService: ICloudService) { }

  async execute(
    prefix: Prefix,
    filename: string,
    filepath: string,
    contentType: ContentType,
  ): Promise<string> {
    const uploadResult = await this._cloudService.upload(filepath, {
      key: `${prefix}${Date.now()}-${filename}`,
      contentType,
    });

    if (!uploadResult.success || !uploadResult.data) {
      throw new InternalServerError(uploadResult.error || 'Failed to upload chat attachment');
    }

    await unlink(filepath).catch(() => { });

    return uploadResult.data.key;
  }
}
