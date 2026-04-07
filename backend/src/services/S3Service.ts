import {
  PutObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import {
  UploadOptions,
  UploadResult,
  DeleteResult,
  UpdateResult,
  ICloudService,
} from '~service-interfaces/ICloudService';
import fs from 'fs';
import { getS3Client } from '~config/s3';
import { env } from '~config/env';

export class S3Service implements ICloudService {
  private get _s3() {
    return getS3Client();
  }

  private get _bucket() {
    return env.AWS_BUCKET;
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

      await this._s3.send(
        new PutObjectCommand({
          Bucket: this._bucket,
          Key: key,
          Body: fileStream,
          ContentType: options.contentType,
        }),
      );

      return {
        success: true,
        data: {
          key,
          url: `https://${this._bucket}.s3.amazonaws.com/${key}`,
        },
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'S3 upload failed',
      };
    }
  }

  async uploadBuffer(
    buffer: Buffer,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    try {
      const command = new PutObjectCommand({
        Bucket: this._bucket,
        Key: options.key,
        Body: buffer,
        ContentType: options.contentType,
      });

      await this._s3.send(command);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'S3 upload failed',
      };
    }
  }

  async update(fromKey: string, toKey: string): Promise<UpdateResult> {
    try {
      await this._s3.send(
        new CopyObjectCommand({
          Bucket: this._bucket,
          CopySource: `${this._bucket}/${fromKey}`,
          Key: toKey,
        }),
      );

      await this._s3.send(
        new DeleteObjectCommand({
          Bucket: this._bucket,
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

  async copy(fromKey: string, toKey: string): Promise<UpdateResult> {
    try {
      await this._s3.send(
        new CopyObjectCommand({
          Bucket: this._bucket,
          CopySource: encodeURI(`${this._bucket}/${fromKey}`),
          Key: toKey,
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
            : 'Failed to copy object',
      };
    }
  }

  async delete(key: string): Promise<DeleteResult> {
    try {
      await this._s3.send(
        new DeleteObjectCommand({
          Bucket: this._bucket,
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
