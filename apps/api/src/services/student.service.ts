import { prisma } from '@school-mgmt/shared';
import { CacheService } from '../shared/utils/cache.service';
import { StorageService } from '../shared/utils/storage.service';
import { parse } from 'csv-parse/sync';
import { logger } from '../shared/utils/logger';

export class StudentService {
  static async createStudent(data: any) {
    const student = await prisma.student.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        birthDate: data.birthDate,
        matricule: data.matricule,
        schoolId: data.schoolId
      }
    });

    // Invalider le cache
    await CacheService.invalidate(`students:${data.schoolId}`);
    return student;
  }

  static async listStudents(schoolId: string) {
    const cacheKey = `students:${schoolId}`;
    return CacheService.getOrSet(cacheKey, async () => {
      return prisma.student.findMany({
        where: { schoolId },
        include: { enrollments: true },
        orderBy: { lastName: 'asc' }
      });
    });
  }

  static async importFromCSV(schoolId: string, buffer: Buffer) {
    const records = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    const studentsToCreate = records.map((record: any) => ({
      firstName: record.prenom,
      lastName: record.nom,
      birthDate: new Date(record.date_naissance),
      matricule: record.matricule,
      schoolId: schoolId,
    }));

    const result = await prisma.$transaction(async (tx: any) => {
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

    await CacheService.invalidate(`students:${schoolId}`);
    return result;
  }

  static async enrollStudent(data: any) {
    return prisma.enrollment.create({
      data: {
        studentId: data.studentId,
        classId: data.classId,
        yearId: data.yearId,
        feesTotal: data.feesTotal,
        status: 'ACTIVE'
      }
    });
  }

  static async uploadPhoto(studentId: string, buffer: Buffer, mimetype: string) {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new Error('Élève non trouvé');

    const path = `students/${student.schoolId}/${studentId}/photo.jpg`;
    await StorageService.upload(path, buffer, mimetype);
    return path;
  }

  static async getPhotoUrl(studentId: string) {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new Error('Élève non trouvé');

    const path = `students/${student.schoolId}/${studentId}/photo.jpg`;
    return StorageService.getDownloadUrl(path);
  }
}
