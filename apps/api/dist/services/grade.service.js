"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GradeService = void 0;
const shared_1 = require("@school-mgmt/shared");
const logger_1 = require("../shared/utils/logger");
const notification_service_1 = require("../modules/notifications/notification.service");
const queue_service_1 = require("../shared/utils/queue.service");
class GradeService {
    static async submitGrade(data, tenantId) {
        const grade = await shared_1.prisma.grade.create({
            data: {
                enrollmentId: data.enrollmentId,
                subjectId: data.subjectId,
                value: data.value,
                coeff: data.coeff,
                period: data.period,
                type: data.type
            },
            include: { enrollment: { include: { student: true } } }
        });
        // 1. Notification Parent automatique
        if (grade.enrollment.student.parentId) {
            await notification_service_1.NotificationService.sendInApp({
                tenantId: tenantId,
                userId: grade.enrollment.student.parentId,
                title: 'Nouvelle Note Disponible',
                message: `Une note de ${data.value}/20 a été saisie en ${data.subjectId} pour ${grade.enrollment.student.firstName}.`,
                type: 'SUCCESS'
            });
            // Alerte note < 10
            if (data.value < 10) {
                await notification_service_1.NotificationService.notifyLowGrade(tenantId, grade.enrollment.student.parentId, grade.enrollment.student.firstName, data.subjectId, data.value);
            }
        }
        return grade;
    }
    static async listByEnrollment(enrollmentId) {
        return shared_1.prisma.grade.findMany({
            where: { enrollmentId },
            orderBy: { createdAt: 'desc' }
        });
    }
    static async listByClassAndSubject(classId, subjectId, period) {
        return shared_1.prisma.grade.findMany({
            where: {
                subjectId,
                period,
                enrollment: {
                    classId
                }
            },
            include: {
                enrollment: {
                    include: {
                        student: true
                    }
                }
            },
            orderBy: {
                enrollment: {
                    student: {
                        lastName: 'asc'
                    }
                }
            }
        });
    }
    static async getAverageByEnrollment(enrollmentId) {
        const grades = await shared_1.prisma.grade.findMany({
            where: { enrollmentId }
        });
        if (grades.length === 0)
            return 0;
        const totalWeighted = grades.reduce((acc, g) => acc + (Number(g.value) * g.coeff), 0);
        const totalCoeff = grades.reduce((acc, g) => acc + g.coeff, 0);
        return totalCoeff > 0 ? (totalWeighted / totalCoeff) : 0;
    }
    static async launchReportGeneration(data) {
        const { schoolId, period, yearId } = data;
        // 1. Récupérer tous les élèves actifs de l'école
        const students = await shared_1.prisma.student.findMany({
            where: { schoolId, deletedAt: null },
            select: { id: true }
        });
        logger_1.logger.info(`Lancement de la génération pour ${students.length} élèves...`);
        // 2. Ajouter un job par élève dans la file d'attente
        for (const student of students) {
            await queue_service_1.QueueService.addReportJob({
                schoolId,
                studentId: student.id,
                period,
                year: yearId
            });
        }
        return true;
    }
}
exports.GradeService = GradeService;
