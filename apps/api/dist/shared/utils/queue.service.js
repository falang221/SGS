"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = exports.reportQueue = void 0;
const bullmq_1 = require("bullmq");
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)();
const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
};
exports.reportQueue = new bullmq_1.Queue('report-queue', { connection });
class QueueService {
    static async addReportJob(data) {
        try {
            await exports.reportQueue.add('generate-report', data, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
            });
            logger.info(`Job de bulletin ajouté pour l'élève ${data.studentId}`);
        }
        catch (error) {
            logger.error('Erreur lors de l\'ajout au BullMQ:', error);
            throw error;
        }
    }
}
exports.QueueService = QueueService;
