import { Request, Response } from 'express';
import { prisma } from '@school-mgmt/shared';
import { UnauthorizedError } from '../../shared/utils/errors';

export class ParentController {
  private static getParentId(req: Request): string {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    return req.user.id;
  }
  
  // Lister tous les enfants rattachés au parent connecté (Section 3.1)
  static async getChildren(req: Request, res: Response) {
    try {
      const parentId = ParentController.getParentId(req);
      
      const children = await prisma.student.findMany({
        where: { parentId },
        include: { 
          school: { select: { name: true } },
          enrollments: { 
             where: { status: 'ACTIVE' },
             include: { class: true }
          }
        }
      });

      return res.json(children);
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({ error: error.message || 'Erreur lors de la récupération de la fratrie' });
    }
  }

  // Consulter les notes d'un enfant spécifique
  static async getGrades(req: Request, res: Response) {
    const { studentId } = req.params;
    try {
      const parentId = ParentController.getParentId(req);

      // Vérifier que c'est bien l'enfant du parent (Section 3.2)
      const student = await prisma.student.findFirst({
        where: { id: studentId, parentId }
      });

      if (!student) return res.status(403).json({ error: 'Accès non autorisé à ce dossier' });

      const grades = await prisma.grade.findMany({
        where: { enrollment: { studentId } },
        orderBy: { createdAt: 'desc' }
      });

      return res.json(grades);
    } catch (error: any) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des notes' });
    }
  }

  // Consulter l'historique des paiements d'un enfant
  static async getPayments(req: Request, res: Response) {
    const { studentId } = req.params;
    try {
      const parentId = ParentController.getParentId(req);

      const student = await prisma.student.findFirst({
        where: { id: studentId, parentId }
      });

      if (!student) return res.status(403).json({ error: 'Accès non autorisé à ce dossier' });

      const payments = await prisma.payment.findMany({
        where: { enrollment: { studentId, student: { parentId } } },
        orderBy: { createdAt: 'desc' }
      });

      return res.json(payments);
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({ error: error.message || 'Erreur lors de la récupération des paiements' });
    }
  }
}
