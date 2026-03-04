"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const logger_1 = require("./logger");
const s3Client = new client_s3_1.S3Client({
    region: process.env.S3_REGION || 'auto',
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    },
});
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'sgs-documents';
class StorageService {
    static async upload(path, body, contentType) {
        try {
            const command = new client_s3_1.PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: path,
                Body: body,
                ContentType: contentType,
            });
            await s3Client.send(command);
            logger_1.logger.info(`[Storage] Bulletin uploadé vers S3 : ${path}`);
            return path;
        }
        catch (error) {
            logger_1.logger.error(`[Storage] Erreur upload bulletin ${path} :`, error);
            throw error;
        }
    }
}
exports.StorageService = StorageService;
