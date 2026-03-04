import { Worker, Job } from 'bullmq';
import { PDFService } from './services/pdf.service';
import { RankingService } from './services/ranking.service';
import { StorageService } from './shared/utils/storage.service';
import pino from 'pino';
import dotenv from 'dotenv';
import { prisma } from '@school-mgmt/shared';

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

const reportWorker = new Worker('report-queue', async (job: Job) => {
  const { schoolId, studentId, period, year } = job.data;
  
  logger.info(`Traitement bulletin pour l'élève ${studentId} (${period})`);

  try {
    // 1. Récupération des données réelles (Section 4.1)
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { 
        school: true, 
        enrollments: { 
          where: { yearId: year }, 
          include: { class: true } 
        } 
      }
    });

    if (!student || student.enrollments.length === 0) {
      throw new Error('Élève ou inscription non trouvée');
    }

    const currentEnrollment = student.enrollments[0];
    const classId = currentEnrollment.classId;

    // 2. Calcul du rang et de la moyenne de classe via le nouveau service
    const rankingData = await RankingService.calculateRank(classId, year, period, studentId);

    const grades = await prisma.grade.findMany({
      where: { enrollment: { studentId }, period }
    });

    const average = grades.reduce((acc: number, g: any) => acc + (Number(g.value) * g.coeff), 0) / 
                   grades.reduce((acc: number, g: any) => acc + g.coeff, 0);

    // 3. Génération du PDF avec Puppeteer (Section 6.3)
    const pdfBuffer = await PDFService.generateReport({
      schoolName: student.school.name,
      studentName: `${student.firstName} ${student.lastName}`,
      className: currentEnrollment.class?.name || 'N/A',
      matricule: student.matricule,
      birthDate: student.birthDate.toLocaleDateString('fr-FR'),
      period,
      year,
      grades,
      average: average.toFixed(2),
      rank: `${RankingService.formatRank(rankingData.rank)}/${rankingData.total}`,
      classAverage: rankingData.classAverage.toString()
    });

    // 4. Stockage réel (AWS S3 / Cloudflare R2)
    const storagePath = `bulletins/${year}/${period}/${studentId}.pdf`;
    await StorageService.upload(storagePath, pdfBuffer, 'application/pdf');

    logger.info(`Bulletin généré et archivé pour ${student.lastName} : Rang ${rankingData.rank}/${rankingData.total}`);
    
    return { status: 'SUCCESS', path: storagePath, rank: rankingData.rank };

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
