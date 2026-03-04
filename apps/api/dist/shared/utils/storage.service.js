"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const logger_1 = require("./logger");
const s3Client = new client_s3_1.S3Client({
    region: process.env.S3_REGION || 'auto',
    endpoint: process.env.S3_ENDPOINT, // Pour Cloudflare R2 ou Minio
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    },
});
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'sgs-documents';
class StorageService {
    /**
     * Upload un fichier vers le stockage S3/R2
     */
    static async upload(path, body, contentType) {
        try {
            const command = new client_s3_1.PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: path,
                Body: body,
                ContentType: contentType,
            });
            await s3Client.send(command);
            logger_1.logger.info(`[Storage] Fichier uploadé avec succès: ${path}`);
            return path;
        }
        catch (error) {
            logger_1.logger.error(`[Storage] Erreur upload ${path}:`, error);
            throw new Error('Erreur lors de la sauvegarde du document');
        }
    }
    /**
     * Génère une URL signée temporaire pour lire un fichier
     */
    static async getDownloadUrl(path, expiresId = 3600) {
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: path,
            });
            return await (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn: expiresId });
        }
        catch (error) {
            logger_1.logger.error(`[Storage] Erreur génération URL signée ${path}:`, error);
            return null;
        }
    }
}
exports.StorageService = StorageService;
