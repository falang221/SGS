import { Request, Response } from 'express';
import { SubjectCreateSchema, TimetableCreateSchema } from './academic.dto';
import { AcademicService } from '../../services/academic.service';
import { UnauthorizedError } from '../../shared/utils/errors';

export class AcademicController {
  
  static async createSubject(req: Request, res: Response) {
    try {
      const data = SubjectCreateSchema.parse(req.body);
      const subject = await AcademicService.createSubject(data);
      return res.status(201).json(subject);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async listSubjects(req: Request, res: Response) {
    const { schoolId } = req.params;
    try {
      const subjects = await AcademicService.listSubjects(schoolId);
      return res.json(subjects);
    } catch (error: any) {
      return res.status(500).json({ error: "Erreur lors de la récupération des matières" });
    }
  }

  static async createTimetableEntry(req: Request, res: Response) {
    try {
      const data = TimetableCreateSchema.parse(req.body);
      const entry = await AcademicService.createTimetableEntry(data);
      return res.status(201).json(entry);
    } catch (error: any) {
      const status = error.statusCode || 400;
      return res.status(status).json({ error: error.message });
    }
  }

  static async getTimetableByClass(req: Request, res: Response) {
    const { classId } = req.params;
    try {
      const timetable = await AcademicService.getTimetableByClass(classId);
      return res.json(timetable);
    } catch (error: any) {
      return res.status(500).json({ error: "Erreur lors de la récupération de l'emploi du temps" });
    }
  }

  static async listClasses(req: Request, res: Response) {
    const { schoolId } = req.params;
    try {
      const classes = await AcademicService.listClasses(schoolId);
      return res.json(classes);
    } catch (error: any) {
      return res.status(500).json({ error: "Erreur lors de la récupération des classes" });
    }
  }
}
