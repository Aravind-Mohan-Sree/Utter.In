export interface S3Config {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export interface UploadOptions {
  folder?: string;
  key?: string;
  contentType?: string;
}

export interface UploadResult {
  success: boolean;
  data?: {
    key: string;
    url: string;
  };
  error?: string;
}

export interface UpdateResult {
  success: boolean;
  from?: string;
  to?: string;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface IS3Service {
  upload(filePath: string, options?: UploadOptions): Promise<UploadResult>;
  update(fromKey: string, toKey: string): Promise<UpdateResult>;
  delete(key: string): Promise<DeleteResult>;
}
