"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const shared_1 = require("@school-mgmt/shared");
const notification_service_1 = require("../modules/notifications/notification.service");
class AttendanceService {
    static async submitBulk(data, teacherId, tenantId) {
        const result = await shared_1.prisma.$transaction(data.map((item) => shared_1.prisma.attendance.create({
            data: {
                enrollmentId: item.enrollmentId,
                status: item.status,
                date: item.date || new Date(),
                reason: item.reason,
                reportedById: teacherId
            },
            include: { enrollment: { include: { student: true } } }
        })));
        // Traitement asynchrone des notifications (on ne bloque pas la réponse)
        this.processNotifications(result, tenantId).catch(console.error);
        return result;
    }
    static async processNotifications(records, tenantId) {
        for (const record of records) {
            if (record.status === 'ABSENT' && record.enrollment.student.parentId) {
                await notification_service_1.NotificationService.notifyAbsence(tenantId, record.enrollment.student.parentId, record.enrollment.student.firstName);
            }
        }
    }
    static async getHistoryByEnrollment(enrollmentId) {
        return shared_1.prisma.attendance.findMany({
            where: { enrollmentId },
            orderBy: { date: 'desc' }
        });
    }
    static async getDailyStats(schoolId, date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const stats = await shared_1.prisma.attendance.groupBy({
            by: ['status'],
            where: {
                enrollment: { student: { schoolId } },
                date: { gte: startOfDay, lte: endOfDay }
            },
            _count: { id: true }
        });
        const initialStats = {
            PRESENT: 0,
            ABSENT: 0,
            LATE: 0,
            EXCUSED: 0
        };
        return stats.reduce((acc, curr) => ({
            ...acc,
            [curr.status]: curr._count.id
        }), initialStats);
    }
}
exports.AttendanceService = AttendanceService;
