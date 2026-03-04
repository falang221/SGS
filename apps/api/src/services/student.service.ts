import { prisma } from '@school-mgmt/shared';
import { CacheService } from '../shared/utils/cache.service';
import { StorageService } from '../shared/utils/storage.service';
import { parse } from 'csv-parse/sync';
import { logger } from '../shared/utils/logger';

export interface StudentInput {
  firstName: string;
  lastName: string;
  birthDate: Date;
  matricule: string;
  schoolId: string;
}

export class StudentService {
  static async createStudent(data: StudentInput) {
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
        include: { 
          enrollments: {
            include: { class: true } // Éviter N+1 pour les classes
          } 
        },
        orderBy: { lastName: 'asc' }
      });
    });
  }

  /**
   * Import massif d'élèves (Optimisé)
   */
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

    // Utilisation de createMany pour une performance maximale
    // Note: skipDuplicates est disponible sur PostgreSQL
    const result = await prisma.student.createMany({
      data: studentsToCreate,
      skipDuplicates: true
    });

    await CacheService.invalidate(`students:${schoolId}`);
    return result.count;
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
