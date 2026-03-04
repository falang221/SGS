import { prisma, Grade } from '@school-mgmt/shared';
import { logger } from '../shared/utils/logger';
import { NotificationService } from '../modules/notifications/notification.service';
import { QueueService } from '../shared/utils/queue.service';

export class GradeService {
  static async submitGrade(data: any, tenantId: string) {
    const grade = await prisma.grade.create({
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
       await NotificationService.sendInApp({
          tenantId: tenantId,
          userId: grade.enrollment.student.parentId,
          title: 'Nouvelle Note Disponible',
          message: `Une note de ${data.value}/20 a été saisie en ${data.subjectId} pour ${grade.enrollment.student.firstName}.`,
          type: 'SUCCESS'
       });

       // Alerte note < 10
       if (data.value < 10) {
          await NotificationService.notifyLowGrade(
            tenantId,
            grade.enrollment.student.parentId,
            grade.enrollment.student.firstName,
            data.subjectId,
            data.value
          );
       }
    }

    return grade;
  }

  static async listByEnrollment(enrollmentId: string) {
    return prisma.grade.findMany({
      where: { enrollmentId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async listByClassAndSubject(classId: string, subjectId: string, period: string) {
    return prisma.grade.findMany({
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

  static async getAverageByEnrollment(enrollmentId: string) {
    const grades = await prisma.grade.findMany({
      where: { enrollmentId }
    });

    if (grades.length === 0) return 0;

    const totalWeighted = grades.reduce((acc: number, g: Grade) => acc + (Number(g.value) * g.coeff), 0);
    const totalCoeff = grades.reduce((acc: number, g: Grade) => acc + g.coeff, 0);

    return totalCoeff > 0 ? (totalWeighted / totalCoeff) : 0;
  }

  static async launchReportGeneration(data: any) {
    const { schoolId, period, yearId } = data;
    
    // 1. Récupérer tous les élèves actifs de l'école
    const students = await prisma.student.findMany({
      where: { schoolId, deletedAt: null },
      select: { id: true }
    });

    logger.info(`Lancement de la génération pour ${students.length} élèves...`);

    // 2. Ajouter un job par élève dans la file d'attente
    for (const student of students) {
      await QueueService.addReportJob({
        schoolId,
        studentId: student.id,
        period,
        year: yearId
      });
    }

    return true;
  }
}
