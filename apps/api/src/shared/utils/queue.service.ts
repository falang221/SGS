import { Queue } from 'bullmq';
import pino from 'pino';

const logger = pino();

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const reportQueue = new Queue('report-queue', { connection });

export class QueueService {
  static async addReportJob(data: { 
    schoolId: string; 
    studentId: string; 
    period: string; 
    year: string; 
  }) {
    try {
      await reportQueue.add('generate-report', data, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      });
      logger.info(`Job de bulletin ajouté pour l'élève ${data.studentId}`);
    } catch (error) {
      logger.error('Erreur lors de l\'ajout au BullMQ:', error);
      throw error;
    }
  }
}
