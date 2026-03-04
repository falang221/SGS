import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { logger } from './logger';

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'auto',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'sgs-documents';

export class StorageService {
  static async upload(path: string, body: Buffer, contentType: string) {
    try {
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: path,
        Body: body,
        ContentType: contentType,
      });

      await s3Client.send(command);
      logger.info(`[Storage] Bulletin uploadé vers S3 : ${path}`);
      return path;
    } catch (error) {
      logger.error(`[Storage] Erreur upload bulletin ${path} :`, error);
      throw error;
    }
  }
}
