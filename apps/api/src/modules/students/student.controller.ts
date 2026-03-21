import { Request, Response } from 'express';
import { logger } from '../../shared/utils/logger';
import { StudentCreateSchema, EnrollmentCreateSchema } from './student.dto';
import { StudentService } from '../../services/student.service';
import { UnauthorizedError } from '../../shared/utils/errors';

export class StudentController {
  
  static async uploadPhoto(req: Request, res: Response) {
    if (!req.file) {
      return res.status(400).json({ error: 'Photo requise' });
    }

    const { studentId } = req.params;

    try {
      if (!req.user) throw new UnauthorizedError();
      const path = await StudentService.uploadPhoto(studentId, req.file.buffer, req.file.mimetype, req.user.tenantId);
      return res.json({ message: 'Photo uploadée avec succès', path });
    } catch (error: any) {
      const status = error.statusCode || (error.message === 'Élève non trouvé' ? 404 : 500);
      return res.status(status).json({ error: error.message });
    }
  }

  static async getPhotoUrl(req: Request, res: Response) {
    const { studentId } = req.params;
    try {
      if (!req.user) throw new UnauthorizedError();
      const url = await StudentService.getPhotoUrl(studentId, req.user.tenantId);
      return res.json({ url });
    } catch (error: any) {
      const status = error.statusCode || (error.message === 'Élève non trouvé' ? 404 : 500);
      return res.status(status).json({ error: error.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const data = StudentCreateSchema.parse(req.body);
      const student = await StudentService.createStudent(data, req.user.tenantId);
      return res.status(201).json(student);
    } catch (error: any) {
      return res.status(error.statusCode || 400).json({ error: error.message });
    }
  }

  static async importCSV(req: Request, res: Response) {
    if (!req.file) {
      return res.status(400).json({ error: 'Fichier CSV requis' });
    }

    const schoolId = req.body.schoolId;
    if (!schoolId) {
      return res.status(400).json({ error: 'School ID requis' });
    }

    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await StudentService.importFromCSV(schoolId, req.file.buffer, req.user.tenantId);
      logger.info(`Import réussi : ${result} élèves traités pour l'école ${schoolId}`);
      return res.json({ message: `${result} élèves importés ou mis à jour avec succès.` });
    } catch (error: any) {
      logger.error('Erreur Import CSV:', error);
      return res.status(error.statusCode || 400).json({ error: error.message || 'Format CSV invalide ou données corrompues' });
    }
  }

  static async listBySchool(req: Request, res: Response) {
    const { schoolId } = req.params;
    try {
      if (!req.user) throw new UnauthorizedError();
      const students = await StudentService.listStudents(schoolId, req.user.tenantId);
      return res.json(students);
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({ error: error.message || 'Erreur lors de la récupération des élèves' });
    }
  }

  static async enroll(req: Request, res: Response) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const data = EnrollmentCreateSchema.parse(req.body);
      const enrollment = await StudentService.enrollStudent(data, req.user.tenantId);
      return res.status(201).json(enrollment);
    } catch (error: any) {
      return res.status(error.statusCode || 400).json({ error: error.message });
    }
  }
}
