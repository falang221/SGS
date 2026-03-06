import { Request, Response } from 'express';
import { prisma } from '@school-mgmt/shared';

export class ParentController {
  
  // Lister tous les enfants rattachés au parent connecté (Section 3.1)
  static async getChildren(req: Request, res: Response) {
    try {
      // @ts-ignore
      const parentId = req.user.id;
      
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
      return res.status(500).json({ error: 'Erreur lors de la récupération de la fratrie' });
    }
  }

  // Consulter les notes d'un enfant spécifique
  static async getGrades(req: Request, res: Response) {
    const { studentId } = req.params;
    try {
      // @ts-ignore
      const parentId = req.user.id;

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
      // @ts-ignore
      const parentId = req.user.id;

      const payments = await prisma.payment.findMany({
        where: { enrollment: { studentId, student: { parentId } } },
        orderBy: { createdAt: 'desc' }
      });

      return res.json(payments);
    } catch (error: any) {
      return res.status(500).json({ error: 'Erreur lors de la récupération des paiements' });
    }
  }
}
