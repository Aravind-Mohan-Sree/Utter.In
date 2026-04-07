import { S3Client } from '@aws-sdk/client-s3';
import { env } from '~config/env';

let instance: S3Client | null = null;

export const getS3Client = () => {
  if (!instance) {
    if (!env.AWS_REGION) {
      throw new Error('AWS_REGION is missing in environment config');
    }
    instance = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return instance;
};
