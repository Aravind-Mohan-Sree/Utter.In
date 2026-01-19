import { unlink } from 'fs/promises';
import { InternalServerError } from '~errors/HttpError';
import { ICloudService } from '~service-interfaces/ICloudService';
import {
  ContentType,
  IUploadFileUseCase,
  Prefix,
} from '~use-case-interfaces/shared/IFileUseCase';

export class UploadFileUseCase implements IUploadFileUseCase {
  constructor(private cloudService: ICloudService) {}

  async execute(
    prefix: Prefix,
    filename: string,
    filepath: string,
    contentType: ContentType,
  ): Promise<void> {
    const uploadResult = await this.cloudService.upload(filepath, {
      key: `${prefix}${filename}.${contentType.split('/')[1]}`,
      contentType,
    });

    if (!uploadResult.success) {
      throw new InternalServerError(uploadResult.error);
    }

    await unlink(filepath);
  }
}
