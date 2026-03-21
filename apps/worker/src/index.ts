import net from 'node:net';
import { Worker, Job } from 'bullmq';
import pino from 'pino';
import dotenv from 'dotenv';
import { processReportJob, ReportJobData } from './process-report';

dotenv.config();

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

// Connexion Redis (Section 1.1)
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

async function isRedisReachable(host: string, port: number) {
  return new Promise<boolean>((resolve) => {
    const socket = net.createConnection({ host, port });
    const done = (result: boolean) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(1000);
    socket.once('connect', () => done(true));
    socket.once('error', () => done(false));
    socket.once('timeout', () => done(false));
  });
}

export async function startReportWorker() {
  const redisAvailable = await isRedisReachable(connection.host, connection.port);
  if (!redisAvailable) {
    logger.warn('Redis indisponible, worker de bulletins lancé en veille');
    return null;
  }

  const reportWorker = new Worker('report-queue', async (job: Job<ReportJobData>) => {
    const { studentId, period } = job.data;
    
    logger.info(`Traitement bulletin pour l'élève ${studentId} (${period})`);

    try {
      const result = await processReportJob(job.data);
      logger.info(`Bulletin généré et archivé pour ${studentId} : Rang ${result.rank}`);
      return result;

    } catch (error: any) {
      logger.error(`Échec génération bulletin ${studentId}: ${error.message}`);
      throw error; // BullMQ gère le retry (Section 1.2)
    }
  }, { connection });

  reportWorker.on('completed', (job) => {
    logger.info(`Job ${job.id} terminé.`);
  });

  reportWorker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} en échec: ${err.message}`);
  });

  logger.info('🚀 Worker de génération de bulletins démarré');
  return reportWorker;
}

if (process.env.NODE_ENV !== 'test') {
  void startReportWorker();
}
