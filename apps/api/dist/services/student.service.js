"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentService = void 0;
const shared_1 = require("@school-mgmt/shared");
const cache_service_1 = require("../shared/utils/cache.service");
const storage_service_1 = require("../shared/utils/storage.service");
const sync_1 = require("csv-parse/sync");
class StudentService {
    static async createStudent(data) {
        const student = await shared_1.prisma.student.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                birthDate: data.birthDate,
                matricule: data.matricule,
                schoolId: data.schoolId
            }
        });
        // Invalider le cache
        await cache_service_1.CacheService.invalidate(`students:${data.schoolId}`);
        return student;
    }
    static async listStudents(schoolId) {
        const cacheKey = `students:${schoolId}`;
        return cache_service_1.CacheService.getOrSet(cacheKey, async () => {
            return shared_1.prisma.student.findMany({
                where: { schoolId },
                include: { enrollments: true },
                orderBy: { lastName: 'asc' }
            });
        });
    }
    static async importFromCSV(schoolId, buffer) {
        const records = (0, sync_1.parse)(buffer, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });
        const studentsToCreate = records.map((record) => ({
            firstName: record.prenom,
            lastName: record.nom,
            birthDate: new Date(record.date_naissance),
            matricule: record.matricule,
            schoolId: schoolId,
        }));
        const result = await shared_1.prisma.$transaction(async (tx) => {
            let createdCount = 0;
            for (const studentData of studentsToCreate) {
                await tx.student.upsert({
                    where: { matricule: studentData.matricule },
                    update: studentData,
                    create: studentData,
                });
                createdCount++;
            }
            return createdCount;
        });
        await cache_service_1.CacheService.invalidate(`students:${schoolId}`);
        return result;
    }
    static async enrollStudent(data) {
        return shared_1.prisma.enrollment.create({
            data: {
                studentId: data.studentId,
                classId: data.classId,
                yearId: data.yearId,
                feesTotal: data.feesTotal,
                status: 'ACTIVE'
            }
        });
    }
    static async uploadPhoto(studentId, buffer, mimetype) {
        const student = await shared_1.prisma.student.findUnique({ where: { id: studentId } });
        if (!student)
            throw new Error('Élève non trouvé');
        const path = `students/${student.schoolId}/${studentId}/photo.jpg`;
        await storage_service_1.StorageService.upload(path, buffer, mimetype);
        return path;
    }
    static async getPhotoUrl(studentId) {
        const student = await shared_1.prisma.student.findUnique({ where: { id: studentId } });
        if (!student)
            throw new Error('Élève non trouvé');
        const path = `students/${student.schoolId}/${studentId}/photo.jpg`;
        return storage_service_1.StorageService.getDownloadUrl(path);
    }
}
exports.StudentService = StudentService;
