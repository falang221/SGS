import { Request, Response } from 'express';
import { logger } from '../../shared/utils/logger';
import { StudentCreateSchema, EnrollmentCreateSchema } from './student.dto';
import { StudentService } from '../../services/student.service';

export class StudentController {
  
  static async uploadPhoto(req: Request, res: Response) {
    if (!req.file) {
      return res.status(400).json({ error: 'Photo requise' });
    }

    const { studentId } = req.params;

    try {
      const path = await StudentService.uploadPhoto(studentId, req.file.buffer, req.file.mimetype);
      return res.json({ message: 'Photo uploadée avec succès', path });
    } catch (error: any) {
      const status = error.message === 'Élève non trouvé' ? 404 : 500;
      return res.status(status).json({ error: error.message });
    }
  }

  static async getPhotoUrl(req: Request, res: Response) {
    const { studentId } = req.params;
    try {
      const url = await StudentService.getPhotoUrl(studentId);
      return res.json({ url });
    } catch (error: any) {
      const status = error.message === 'Élève non trouvé' ? 404 : 500;
      return res.status(status).json({ error: error.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const data = StudentCreateSchema.parse(req.body);
      const student = await StudentService.createStudent(data);
      return res.status(201).json(student);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
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
      const result = await StudentService.importFromCSV(schoolId, req.file.buffer);
      logger.info(`Import réussi : ${result} élèves traités pour l'école ${schoolId}`);
      return res.json({ message: `${result} élèves importés ou mis à jour avec succès.` });
    } catch (error: any) {
      logger.error('Erreur Import CSV:', error);
      return res.status(400).json({ error: 'Format CSV invalide ou données corrompues' });
    }
  }

  static async listBySchool(req: Request, res: Response) {
    const { schoolId } = req.params;
    try {
      const students = await StudentService.listStudents(schoolId);
      return res.json(students);
    } catch (error: any) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des élèves' });
    }
  }

  static async enroll(req: Request, res: Response) {
    try {
      const data = EnrollmentCreateSchema.parse(req.body);
      const enrollment = await StudentService.enrollStudent(data);
      return res.status(201).json(enrollment);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
