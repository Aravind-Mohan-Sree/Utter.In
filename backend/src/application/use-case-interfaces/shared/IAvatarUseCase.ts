export interface IUploadAvatarUseCase {
  execute(id: string, avatarPath: string): Promise<void>;
}

export interface IDeleteAvatarUseCase {
  execute(id: string): Promise<void>;
}
