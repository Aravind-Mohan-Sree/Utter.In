import { InternalServerError } from '~errors/HttpError';
import { ICloudService } from '~service-interfaces/ICloudService';
import {
  ContentType,
  IDeleteFileUseCase,
  Prefix,
} from '~use-case-interfaces/shared/IFileUseCase';

export class DeleteFileUseCase implements IDeleteFileUseCase {
  constructor(private cloudService: ICloudService) {}

  async execute(
    prefix: Prefix,
    filename: string,
    contentType: ContentType,
  ): Promise<void> {
    const deleteResult = await this.cloudService.delete(
      `${prefix}${filename}.${contentType.split('/')[1]}`,
    );

    if (!deleteResult.success) {
      throw new InternalServerError(deleteResult.error);
    }
  }
}
