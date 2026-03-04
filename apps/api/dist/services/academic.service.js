"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicService = void 0;
const shared_1 = require("@school-mgmt/shared");
const cache_service_1 = require("../shared/utils/cache.service");
const errors_1 = require("../shared/utils/errors");
class AcademicService {
    static async createSubject(data) {
        const subject = await shared_1.prisma.subject.create({ data });
        await cache_service_1.CacheService.invalidate(`subjects:${data.schoolId}`);
        return subject;
    }
    static async listSubjects(schoolId) {
        const cacheKey = `subjects:${schoolId}`;
        return cache_service_1.CacheService.getOrSet(cacheKey, async () => {
            return shared_1.prisma.subject.findMany({ where: { schoolId } });
        });
    }
    static async createTimetableEntry(data) {
        // 1. Vérification des conflits (Enseignant/Classe/Salle)
        const conflict = await shared_1.prisma.timetableEntry.findFirst({
            where: {
                dayOfWeek: data.dayOfWeek,
                deletedAt: null,
                OR: [
                    { classId: data.classId },
                    { staffId: data.staffId },
                    { room: data.room && data.room !== "" ? data.room : undefined }
                ],
                AND: [
                    { startTime: { lt: data.endTime } },
                    { endTime: { gt: data.startTime } }
                ]
            }
        });
        if (conflict) {
            throw new errors_1.ConflictError("Conflit détecté : La classe, l'enseignant ou la salle est déjà occupé sur ce créneau.");
        }
        return shared_1.prisma.timetableEntry.create({ data });
    }
    static async getTimetableByClass(classId) {
        return shared_1.prisma.timetableEntry.findMany({
            where: { classId },
            include: {
                subject: true,
                staff: {
                    include: {
                        user: {
                            select: { email: true }
                        }
                    }
                }
            },
            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
        });
    }
    static async listClasses(schoolId) {
        return shared_1.prisma.class.findMany({
            where: { schoolId }
        });
    }
}
exports.AcademicService = AcademicService;
