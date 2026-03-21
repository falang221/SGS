import { prismaMock } from '../test/setup';
import { StudentService } from './student.service';
import { StorageService } from '../shared/utils/storage.service';

describe('StudentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createStudent', () => {
    it('rejette la création si école hors tenant', async () => {
      // @ts-ignore
      prismaMock.school.findFirst.mockResolvedValue(null);

      await expect(
        StudentService.createStudent(
          {
            firstName: 'Awa',
            lastName: 'Diop',
            birthDate: new Date('2010-01-01'),
            matricule: 'MAT-1',
            schoolId: 'school-1',
          },
          'tenant-1',
        ),
      ).rejects.toThrow('École introuvable pour ce tenant');
    });
  });

  describe('enrollStudent', () => {
    it("rejette l'inscription si l'élève et la classe ne sont pas dans la même école", async () => {
      // @ts-ignore
      prismaMock.student.findFirst.mockResolvedValue({ id: 'student-1', schoolId: 'school-1' });
      // @ts-ignore
      prismaMock.class.findFirst.mockResolvedValue({ id: 'class-1', schoolId: 'school-2' });

      await expect(
        StudentService.enrollStudent(
          {
            studentId: 'student-1',
            classId: 'class-1',
            yearId: '2024-2025',
            feesTotal: 100000,
          },
          'tenant-1',
        ),
      ).rejects.toThrow("L'élève et la classe doivent appartenir à la même école");
    });
  });

  describe('uploadPhoto', () => {
    it("rejette l'upload si l'élève n'appartient pas au tenant", async () => {
      // @ts-ignore
      prismaMock.student.findFirst.mockResolvedValue(null);

      await expect(
        StudentService.uploadPhoto('student-1', Buffer.from('img'), 'image/jpeg', 'tenant-1'),
      ).rejects.toThrow('Élève non trouvé');
    });

    it("stocke la photo dans le chemin de l'école de l'élève", async () => {
      // @ts-ignore
      prismaMock.student.findFirst.mockResolvedValue({ id: 'student-1', schoolId: 'school-1' });
      const uploadSpy = jest.spyOn(StorageService, 'upload').mockResolvedValue(undefined as never);

      const path = await StudentService.uploadPhoto(
        'student-1',
        Buffer.from('img'),
        'image/jpeg',
        'tenant-1',
      );

      expect(uploadSpy).toHaveBeenCalledWith(
        'students/school-1/student-1/photo.jpg',
        expect.any(Buffer),
        'image/jpeg',
      );
      expect(path).toBe('students/school-1/student-1/photo.jpg');
    });
  });
});
