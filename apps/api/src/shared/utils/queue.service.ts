import { Queue } from 'bullmq';
import pino from 'pino';

const logger = pino();

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

let reportQueue: Queue | null = null;

function getReportQueue() {
  if (!reportQueue) {
    reportQueue = new Queue('report-queue', { connection });
  }
  return reportQueue;
}

export async function closeReportQueue() {
  if (reportQueue) {
    await reportQueue.close();
    reportQueue = null;
  }
}

export class QueueService {
  static async addReportJob(data: { 
    schoolId: string; 
    studentId: string; 
    period: string; 
    year: string; 
  }) {
    try {
      const queue = getReportQueue();
      await queue.add('generate-report', data, {
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
