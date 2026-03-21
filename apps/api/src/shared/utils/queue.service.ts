import { Queue } from 'bullmq';
import pino from 'pino';

const logger = pino();
const REPORT_QUEUE_RETRY_COOLDOWN_MS = 10_000;

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

let reportQueue: Queue | null = null;
let queueUnavailableUntil = 0;
let hasLoggedQueueUnavailable = false;

function isQueueCoolingDown(now = Date.now()) {
  return now < queueUnavailableUntil;
}

function markQueueUnavailable(error?: unknown) {
  const now = Date.now();

  if (!isQueueCoolingDown(now)) {
    queueUnavailableUntil = now + REPORT_QUEUE_RETRY_COOLDOWN_MS;
    hasLoggedQueueUnavailable = false;
  }

  if (!hasLoggedQueueUnavailable) {
    logger.warn(
      {
        error,
        retryInMs: REPORT_QUEUE_RETRY_COOLDOWN_MS,
      },
      'BullMQ indisponible, génération de bulletins mise en attente locale',
    );
    hasLoggedQueueUnavailable = true;
  }
}

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
    tenantId: string;
    schoolId: string; 
    studentId: string; 
    period: string; 
    year: string; 
  }) {
    if (isQueueCoolingDown()) {
      return false;
    }

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
      queueUnavailableUntil = 0;
      hasLoggedQueueUnavailable = false;
      return true;
    } catch (error) {
      markQueueUnavailable(error);
      return false;
    }
  }
}
