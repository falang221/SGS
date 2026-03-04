import { Request, Response } from 'express';
import { GradeCreateSchema, ReportGenerateSchema } from './grade.dto';
import { GradeService } from '../../services/grade.service';
import { UnauthorizedError } from '../../shared/utils/errors';
import { AuditService } from '../../shared/utils/audit.service';

export class GradeController {
  
  static async submit(req: Request, res: Response) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const data = GradeCreateSchema.parse(req.body);
      
      const grade = await GradeService.submitGrade(data, req.user.tenantId);

      // Audit Log: Saisie de note
      await AuditService.log({
        userId: req.user.id,
        action: 'GRADE_SUBMIT',
        resource: 'GRADE',
        newValue: { enrollmentId: data.enrollmentId, subjectId: data.subjectId, value: data.value },
        ipAddress: req.ip || '0.0.0.0'
      });

      return res.status(201).json(grade);
    } catch (error: any) {
      return res.status(error.statusCode || 400).json({ error: error.message });
    }
  }

  static async listByEnrollment(req: Request, res: Response) {
    const { enrollmentId } = req.params;
    try {
      const grades = await GradeService.listByEnrollment(enrollmentId);
      return res.json(grades);
    } catch (error: any) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des notes' });
    }
  }

  static async generateReports(req: Request, res: Response) {
    try {
      const data = ReportGenerateSchema.parse(req.body);
      await GradeService.launchReportGeneration(data);
      
      return res.json({ 
        message: 'La génération des bulletins a été lancée en arrière-plan.',
        status: 'PENDING'
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async listByClassAndSubject(req: Request, res: Response) {
    const { classId, subjectId } = req.params;
    const period = req.query.period as string || 'Trimestre 1';
    try {
      const grades = await GradeService.listByClassAndSubject(classId, subjectId, period);
      return res.json(grades);
    } catch (error: any) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des notes' });
    }
  }
}
