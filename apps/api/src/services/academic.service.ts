import { prisma } from '@school-mgmt/shared';
import { CacheService } from '../shared/utils/cache.service';
import { ConflictError } from '../shared/utils/errors';

export class AcademicService {
  static async createSubject(data: any) {
    const subject = await prisma.subject.create({ data });
    await CacheService.invalidate(`subjects:${data.schoolId}`);
    return subject;
  }

  static async listSubjects(schoolId: string) {
    const cacheKey = `subjects:${schoolId}`;
    return CacheService.getOrSet(cacheKey, async () => {
      return prisma.subject.findMany({ where: { schoolId } });
    });
  }

  static async createTimetableEntry(data: any) {
    // 1. Vérification des conflits (Enseignant/Classe/Salle)
    const conflict = await prisma.timetableEntry.findFirst({
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
      throw new ConflictError("Conflit détecté : La classe, l'enseignant ou la salle est déjà occupé sur ce créneau.");
    }

    return prisma.timetableEntry.create({ data });
  }

  static async getTimetableByClass(classId: string) {
    return prisma.timetableEntry.findMany({
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

  static async listClasses(schoolId: string) {
    return prisma.class.findMany({
      where: { schoolId }
    });
  }
}
