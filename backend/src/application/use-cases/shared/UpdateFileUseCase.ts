import { InternalServerError } from '~errors/HttpError';
import { ICloudService } from '~service-interfaces/ICloudService';
import {
  ContentType,
  IUpdateFileUseCase,
  Prefix,
} from '~use-case-interfaces/shared/IFileUseCase';

export class UpdateFileUseCase implements IUpdateFileUseCase {
  constructor(private cloudService: ICloudService) {}

  async execute(
    oldPrefix: Prefix,
    newPrefix: Prefix,
    oldFilename: string,
    newFilename: string,
    contentType: ContentType,
  ): Promise<void> {
    const fromKey = `${oldPrefix}${oldFilename}.${contentType.split('/')[1]}`;
    const toKey = `${newPrefix}${newFilename}.${contentType.split('/')[1]}`;

    const updateResult = await this.cloudService.update(fromKey, toKey);

    if (!updateResult.success)
      throw new InternalServerError(updateResult.error);
  }
}
