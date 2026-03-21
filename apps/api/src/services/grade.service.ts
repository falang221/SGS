import { prisma, Grade } from '@school-mgmt/shared';
import { logger } from '../shared/utils/logger';
import { NotificationService } from '../modules/notifications/notification.service';
import { QueueService } from '../shared/utils/queue.service';

export interface BatchGradeInput {
  subjectId: string;
  classId: string;
  period: string;
  type: string;
  yearId: string;
  grades: {
    enrollmentId: string;
    value: number;
    coeff?: number;
  }[];
}

export class GradeService {
  /**
   * Saisie d'une note individuelle avec notification
   */
  static async submitGrade(data: any, tenantId: string) {
    const grade = await prisma.grade.create({
      data: {
        enrollmentId: data.enrollmentId,
        subjectId: data.subjectId,
        value: data.value,
        coeff: data.coeff || 1,
        period: data.period,
        type: data.type
      },
      include: { 
        enrollment: { 
          include: { 
            student: true,
            class: true
          } 
        },
        subject: true
      }
    });

    // 1. Notification Parent automatique (Asynchrone)
    this.notifyParent(grade, tenantId).catch(err => logger.error('Parent Notification Error:', err));

    return grade;
  }

  /**
   * Saisie massive de notes pour une classe (Optimisé)
   */
  static async submitBatchGrades(data: BatchGradeInput, tenantId: string) {
    const { subjectId, period, type, grades } = data;
    
    // Utilisation d'une transaction pour garantir l'intégrité
    const result = await prisma.$transaction(async (tx: any) => {
      const createdGrades = [];
      for (const g of grades) {
        const grade = await tx.grade.create({
          data: {
            enrollmentId: g.enrollmentId,
            subjectId,
            value: g.value,
            coeff: g.coeff || 1,
            period,
            type
          }
        });
        createdGrades.push(grade);
      }
      return createdGrades;
    });

    logger.info(`[Grades] Batch de ${result.length} notes enregistré pour la classe ${data.classId}`);
    return result;
  }

  /**
   * Calcul complet de la moyenne d'un élève pour une période
   */
  static async calculatePeriodResults(enrollmentId: string, period: string) {
    const grades = await prisma.grade.findMany({
      where: { enrollmentId, period },
      include: { subject: true }
    });

    if (grades.length === 0) return { average: 0, subjects: [] };

    // Groupement par matière
    const subjectStats: Record<string, { total: number; count: number; coeff: number; name: string }> = {};

    grades.forEach((g: any) => {
      if (!subjectStats[g.subjectId]) {
        subjectStats[g.subjectId] = { 
          total: 0, 
          count: 0, 
          coeff: g.subject.coefficient || 1, 
          name: g.subject.name 
        };
      }
      subjectStats[g.subjectId].total += Number(g.value);
      subjectStats[g.subjectId].count += 1;
    });

    // Calcul moyennes par matière et moyenne générale pondérée
    let totalWeightedAverage = 0;
    let totalCoefficients = 0;
    const subjects = [];

    for (const [id, stats] of Object.entries(subjectStats)) {
      const subjectAverage = stats.total / stats.count;
      subjects.push({
        id,
        name: stats.name,
        average: Number(subjectAverage.toFixed(2)),
        coeff: stats.coeff
      });
      totalWeightedAverage += subjectAverage * stats.coeff;
      totalCoefficients += stats.coeff;
    }

    const generalAverage = totalCoefficients > 0 ? (totalWeightedAverage / totalCoefficients) : 0;

    return {
      average: Number(generalAverage.toFixed(2)),
      subjects
    };
  }

  /**
   * Calcul du classement d'une classe pour une période
   */
  static async getClassRanking(classId: string, period: string) {
    const enrollments = await prisma.enrollment.findMany({
      where: { classId, status: 'ACTIVE' },
      include: { student: true }
    });

    const results = await Promise.all(
      enrollments.map(async (e: any) => {
        const stats = await this.calculatePeriodResults(e.id, period);
        return {
          enrollmentId: e.id,
          studentName: `${e.student.firstName} ${e.student.lastName}`,
          average: stats.average
        };
      })
    );

    // Tri par moyenne décroissante
    return results.sort((a, b) => b.average - a.average).map((r, index) => ({
      ...r,
      rank: index + 1
    }));
  }

  private static async notifyParent(grade: any, tenantId: string) {
    if (grade.enrollment.student.parentId) {
       await NotificationService.sendInApp({
          tenantId: tenantId,
          userId: grade.enrollment.student.parentId,
          title: 'Nouvelle Note Disponible',
          message: `Une note de ${Number(grade.value)}/20 a été saisie en ${grade.subject.name} pour ${grade.enrollment.student.firstName}.`,
          type: 'INFO'
       });

       if (Number(grade.value) < 10) {
          await NotificationService.notifyLowGrade(
            tenantId,
            grade.enrollment.student.parentId,
            grade.enrollment.student.firstName,
            grade.subject.name,
            Number(grade.value)
          );
       }
    }
  }

  static async listByClassAndSubject(classId: string, subjectId: string, period: string) {
    return prisma.grade.findMany({
      where: {
        subjectId,
        period,
        enrollment: { classId }
      },
      include: {
        enrollment: {
          include: { student: true }
        }
      },
      orderBy: {
        enrollment: { student: { lastName: 'asc' } }
      }
    });
  }

  static async listByEnrollment(enrollmentId: string) {
    return prisma.grade.findMany({
      where: { enrollmentId },
      include: { subject: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Lancement de la génération massive de bulletins (Worker Queue)
   */
  static async launchReportGeneration(data: any, tenantId: string) {
    const { schoolId, period, yearId } = data;
    
    const students = await prisma.student.findMany({
      where: { schoolId, deletedAt: null },
      select: { id: true }
    });

    logger.info(`[Reports] Lancement de la génération pour ${students.length} bulletins...`);

    let queued = 0;
    let skipped = 0;

    for (const student of students) {
      const enqueued = await QueueService.addReportJob({
        tenantId,
        schoolId,
        studentId: student.id,
        period,
        year: yearId
      });

      if (enqueued) {
        queued += 1;
      } else {
        skipped += 1;
      }
    }

    logger.info(
      `[Reports] Résumé génération bulletins: ${queued} en file, ${skipped} ignorés`,
    );

    return {
      requested: students.length,
      queued,
      skipped,
    };
  }
}
