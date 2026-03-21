import { Request, Response } from 'express';
import { GradeCreateSchema, BatchGradeSchema, RankingQuerySchema, ReportGenerateSchema } from './grade.dto';
import { GradeService } from '../../services/grade.service';
import { UnauthorizedError } from '../../shared/utils/errors';
import { AuditService } from '../../shared/utils/audit.service';

export class GradeController {
  
  /**
   * Saisie d'une note individuelle
   */
  static async submit(req: Request, res: Response) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const data = GradeCreateSchema.parse(req.body);
      
      const grade = await GradeService.submitGrade(data, req.user.tenantId);

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

  /**
   * Saisie groupée (toute une classe d'un coup)
   */
  static async submitBatch(req: Request, res: Response) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const data = BatchGradeSchema.parse(req.body);
      
      const grades = await GradeService.submitBatchGrades(data, req.user.tenantId);

      await AuditService.log({
        userId: req.user.id,
        action: 'GRADE_BATCH_SUBMIT',
        resource: 'GRADE',
        newValue: { classId: data.classId, subjectId: data.subjectId, count: grades.length },
        ipAddress: req.ip || '0.0.0.0'
      });

      return res.status(201).json(grades);
    } catch (error: any) {
      return res.status(error.statusCode || 400).json({ error: error.message });
    }
  }

  /**
   * Classement d'une classe pour une période
   */
  static async getRanking(req: Request, res: Response) {
    try {
      const { classId } = req.params;
      const period = req.query.period as string;
      
      if (!classId || !period) {
        return res.status(400).json({ error: 'classId et period sont requis' });
      }

      const ranking = await GradeService.getClassRanking(classId, period);
      return res.json(ranking);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
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

  /**
   * Lancement de la génération des bulletins
   */
  static async generateReports(req: Request, res: Response) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const data = ReportGenerateSchema.parse(req.body);
      const result = await GradeService.launchReportGeneration(data, req.user.tenantId);

      const isDegraded = result.skipped > 0;
      
      return res.json({ 
        message: isDegraded
          ? 'La file de génération est indisponible pour le moment. Certains bulletins n’ont pas été mis en file.'
          : 'La génération des bulletins a été lancée en arrière-plan.',
        status: isDegraded ? 'DEGRADED' : 'PENDING',
        ...result,
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
