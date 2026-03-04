"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const pdf_service_1 = require("./services/pdf.service");
const ranking_service_1 = require("./services/ranking.service");
const storage_service_1 = require("./shared/utils/storage.service");
const pino_1 = __importDefault(require("pino"));
const dotenv_1 = __importDefault(require("dotenv"));
const shared_1 = require("@school-mgmt/shared");
dotenv_1.default.config();
const logger = (0, pino_1.default)({
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
const reportWorker = new bullmq_1.Worker('report-queue', async (job) => {
    const { schoolId, studentId, period, year } = job.data;
    logger.info(`Traitement bulletin pour l'élève ${studentId} (${period})`);
    try {
        // 1. Récupération des données réelles (Section 4.1)
        const student = await shared_1.prisma.student.findUnique({
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
        const rankingData = await ranking_service_1.RankingService.calculateRank(classId, year, period, studentId);
        const grades = await shared_1.prisma.grade.findMany({
            where: { enrollment: { studentId }, period }
        });
        const average = grades.reduce((acc, g) => acc + (Number(g.value) * g.coeff), 0) /
            grades.reduce((acc, g) => acc + g.coeff, 0);
        // 3. Génération du PDF avec Puppeteer (Section 6.3)
        const pdfBuffer = await pdf_service_1.PDFService.generateReport({
            schoolName: student.school.name,
            studentName: `${student.firstName} ${student.lastName}`,
            className: currentEnrollment.class?.name || 'N/A',
            matricule: student.matricule,
            birthDate: student.birthDate.toLocaleDateString('fr-FR'),
            period,
            year,
            grades,
            average: average.toFixed(2),
            rank: `${ranking_service_1.RankingService.formatRank(rankingData.rank)}/${rankingData.total}`,
            classAverage: rankingData.classAverage.toString()
        });
        // 4. Stockage réel (AWS S3 / Cloudflare R2)
        const storagePath = `bulletins/${year}/${period}/${studentId}.pdf`;
        await storage_service_1.StorageService.upload(storagePath, pdfBuffer, 'application/pdf');
        logger.info(`Bulletin généré et archivé pour ${student.lastName} : Rang ${rankingData.rank}/${rankingData.total}`);
        return { status: 'SUCCESS', path: storagePath, rank: rankingData.rank };
    }
    catch (error) {
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
