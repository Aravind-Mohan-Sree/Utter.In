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
  UpdateResult,
  S3Config,
  ICloudService,
} from '~service-interfaces/ICloudService';
import fs from 'fs';

/**
 * Concrete implementation of ICloudService using Amazon S3.
 * Handles file uploads, renames (move), copies, and deletions in the specified bucket.
 */
export class S3Service implements ICloudService {
  private _s3: S3Client;
  private _bucket: string;

  constructor(config: S3Config) {
    this._bucket = config.bucket;

    this._s3 = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  /**
   * Uploads a file from a local file path to S3.
   * @param filePath Local path to the file.
   * @param options Upload options (folder, key, content type).
   */
  async upload(
    filePath: string,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    try {
      const fileStream = fs.createReadStream(filePath);

      // Generate key if not provided
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

  /**
   * Uploads raw buffer data to S3.
   */
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

  /**
   * Updates an object's key by copying it to the new key and deleting the old one.
   */
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

  /**
   * Copies an object from one key to another within the same bucket.
   */
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

  /**
   * Permanently deletes an object from S3.
   */
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
