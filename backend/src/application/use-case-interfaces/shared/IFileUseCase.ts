import { contentTypes, filePrefixes } from '~constants/fileConstants';

export type Prefix = (typeof filePrefixes)[keyof typeof filePrefixes];

export type ContentType = (typeof contentTypes)[keyof typeof contentTypes];

export interface IUploadAvatarUseCase {
  execute(prefix: Prefix, filename: string, imageUrl: string): Promise<void>;
}

export interface IUploadFileUseCase {
  execute(
    prefix: Prefix,
    filename: string,
    filepath: string,
    contentType: ContentType,
  ): Promise<void>;
}

export interface IUpdateFileUseCase {
  execute(
    oldPrefix: Prefix,
    newPrefix: Prefix,
    oldFilename: string,
    newFilename: string,
    contentType: ContentType,
  ): Promise<void>;
}

export interface IDeleteFileUseCase {
  execute(
    prefix: Prefix,
    filename: string,
    contentType: ContentType,
  ): Promise<void>;
}
