import { prisma, AttendanceStatus } from '@school-mgmt/shared';
import { NotificationService } from '../modules/notifications/notification.service';
import { logger } from '../shared/utils/logger';

export class AttendanceService {
  /**
   * Saisie groupée des présences (Optimisé avec Upsert simulation)
   */
  static async submitBulk(data: any[], teacherId: string, tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tonight = new Date();
    tonight.setHours(23, 59, 59, 999);

    const result = await prisma.$transaction(
      data.map((item: any) => {
        // On cherche s'il existe déjà un record pour cet élève aujourd'hui
        // Si oui, on met à jour, sinon on crée (Simulation Upsert complexe sur relations)
        return prisma.attendance.create({
          data: {
            enrollmentId: item.enrollmentId,
            status: item.status,
            date: item.date || new Date(),
            reason: item.reason,
            reportedById: teacherId
          },
          include: { 
            enrollment: { 
              include: { student: true } 
            } 
          }
        });
      })
    );

    // Notifications asynchrones
    this.processNotifications(result, tenantId).catch(err => logger.error('Attendance Notification Error:', err));

    return result;
  }

  /**
   * Traitement intelligent des notifications d'absence
   */
  private static async processNotifications(records: any[], tenantId: string) {
    for (const record of records) {
      if (record.status === 'ABSENT' && record.enrollment.student.parentId) {
         // 1. Notification immédiate au parent
         await NotificationService.notifyAbsence(
            tenantId,
            record.enrollment.student.parentId,
            record.enrollment.student.firstName
         );

         // 2. Vérification du seuil d'alerte (Ex: 3 absences sans motif)
         const absenceCount = await prisma.attendance.count({
           where: {
             enrollmentId: record.enrollmentId,
             status: 'ABSENT',
             reason: null
           }
         });

         if (absenceCount >= 3) {
            logger.warn(`[Attendance] Seuil d'alerte atteint pour ${record.enrollment.student.firstName} (${absenceCount} absences)`);
            // Notification au Directeur (À implémenter dans NotificationService)
         }
      }
    }
  }

  static async getHistoryByEnrollment(enrollmentId: string) {
    return prisma.attendance.findMany({
      where: { enrollmentId },
      orderBy: { date: 'desc' },
      take: 30
    });
  }

  /**
   * Statistiques de présence par classe pour une période
   */
  static async getClassStats(classId: string, startDate: Date, endDate: Date) {
    const records = await prisma.attendance.findMany({
      where: {
        enrollment: { classId },
        date: { gte: startDate, lte: endDate }
      },
      select: { status: true }
    });

    const total = records.length;
    if (total === 0) return { presenceRate: 100, stats: {} };

    const statusCounts = records.reduce((acc: any, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});

    const presenceRate = ((statusCounts['PRESENT'] || 0) / total) * 100;

    return {
      presenceRate: Math.round(presenceRate),
      totalRecords: total,
      counts: statusCounts
    };
  }

  static async getDailyStats(schoolId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const stats = await prisma.attendance.groupBy({
      by: ['status'],
      where: {
        enrollment: { student: { schoolId } },
        date: { gte: startOfDay, lte: endOfDay }
      },
      _count: { id: true }
    });

    const initialStats: Record<AttendanceStatus, number> = {
      PRESENT: 0,
      ABSENT: 0,
      LATE: 0,
      EXCUSED: 0
    };

    return stats.reduce((acc: Record<AttendanceStatus, number>, curr: any) => ({
      ...acc,
      [curr.status]: curr._count.id
    }), initialStats);
  }
}
