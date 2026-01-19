export type Prefix =
  | 'temp/users/avatars/'
  | 'temp/tutors/avatars/'
  | 'temp/tutors/videos/'
  | 'temp/tutors/certificates/'
  | 'users/avatars/'
  | 'tutors/avatars/'
  | 'tutors/videos/'
  | 'tutors/certificates/';

export type ContentType = 'image/jpeg' | 'video/mp4' | 'application/pdf';

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
