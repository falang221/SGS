import { prisma, AttendanceStatus } from '@school-mgmt/shared';
import { NotificationService } from '../modules/notifications/notification.service';

export class AttendanceService {
  static async submitBulk(data: any[], teacherId: string, tenantId: string) {
    const result = await prisma.$transaction(
      data.map((item: any) => prisma.attendance.create({
        data: {
          enrollmentId: item.enrollmentId,
          status: item.status,
          date: item.date || new Date(),
          reason: item.reason,
          reportedById: teacherId
        },
        include: { enrollment: { include: { student: true } } }
      }))
    );

    // Traitement asynchrone des notifications (on ne bloque pas la réponse)
    this.processNotifications(result, tenantId).catch(console.error);

    return result;
  }

  private static async processNotifications(records: any[], tenantId: string) {
    for (const record of records) {
      if (record.status === 'ABSENT' && record.enrollment.student.parentId) {
         await NotificationService.notifyAbsence(
            tenantId,
            record.enrollment.student.parentId,
            record.enrollment.student.firstName
         );
      }
    }
  }

  static async getHistoryByEnrollment(enrollmentId: string) {
    return prisma.attendance.findMany({
      where: { enrollmentId },
      orderBy: { date: 'desc' }
    });
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
