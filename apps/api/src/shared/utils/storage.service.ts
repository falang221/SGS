import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from './logger';

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'auto',
  endpoint: process.env.S3_ENDPOINT, // Pour Cloudflare R2 ou Minio
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'sgs-documents';

export class StorageService {
  /**
   * Upload un fichier vers le stockage S3/R2
   */
  static async upload(path: string, body: Buffer, contentType: string) {
    try {
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: path,
        Body: body,
        ContentType: contentType,
      });

      await s3Client.send(command);
      logger.info(`[Storage] Fichier uploadé avec succès: ${path}`);
      return path;
    } catch (error) {
      logger.error(`[Storage] Erreur upload ${path}:`, error);
      throw new Error('Erreur lors de la sauvegarde du document');
    }
  }

  /**
   * Génère une URL signée temporaire pour lire un fichier
   */
  static async getDownloadUrl(path: string, expiresId: number = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: path,
      });

      return await getSignedUrl(s3Client, command, { expiresIn: expiresId });
    } catch (error) {
      logger.error(`[Storage] Erreur génération URL signée ${path}:`, error);
      return null;
    }
  }
}
