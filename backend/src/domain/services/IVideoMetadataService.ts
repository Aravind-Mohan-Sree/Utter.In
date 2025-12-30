export interface IVideoMetadataService {
  getDuration(filePath: string): Promise<number>;
}
