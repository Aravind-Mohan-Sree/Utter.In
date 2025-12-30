import {
  S3Client,
  PutObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import {
  UploadOptions,
  UploadResult,
  DeleteResult,
  IUpdateResult,
  S3Config,
} from '~service-interfaces/ICloudService';
import fs from 'fs';

export class S3Service {
  private s3: S3Client;
  private bucket: string;

  constructor(config: S3Config) {
    this.bucket = config.bucket;

    this.s3 = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async upload(
    filePath: string,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    try {
      const fileStream = fs.createReadStream(filePath);

      const key =
        options.key ||
        `${options.folder || 'uploads'}/${Date.now()}-${filePath.split('/').pop()}`;

      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: fileStream,
          ContentType: options.contentType,
        }),
      );

      return {
        success: true,
        data: {
          key,
          url: `https://${this.bucket}.s3.amazonaws.com/${key}`,
        },
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'S3 upload failed',
      };
    }
  }

  async update(fromKey: string, toKey: string): Promise<IUpdateResult> {
    try {
      await this.s3.send(
        new CopyObjectCommand({
          Bucket: this.bucket,
          CopySource: `${this.bucket}/${fromKey}`,
          Key: toKey,
        }),
      );

      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: fromKey,
        }),
      );

      return {
        success: true,
        from: fromKey,
        to: toKey,
      };
    } catch (error: unknown) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to rename/move object',
      };
    }
  }

  async delete(key: string): Promise<DeleteResult> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      return {
        success: true,
        message: 'Object deleted successfully',
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed',
      };
    }
  }
}
