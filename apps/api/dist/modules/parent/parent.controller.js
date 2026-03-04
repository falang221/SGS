"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParentController = void 0;
const index_1 = require("../../index");
class ParentController {
    // Lister tous les enfants rattachés au parent connecté (Section 3.1)
    static async getChildren(req, res) {
        try {
            // @ts-ignore
            const parentId = req.user.id;
            const children = await index_1.prisma.student.findMany({
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
        }
        catch (error) {
            return res.status(500).json({ error: 'Erreur lors de la récupération de la fratrie' });
        }
    }
    // Consulter les notes d'un enfant spécifique
    static async getGrades(req, res) {
        const { studentId } = req.params;
        try {
            // @ts-ignore
            const parentId = req.user.id;
            // Vérifier que c'est bien l'enfant du parent (Section 3.2)
            const student = await index_1.prisma.student.findFirst({
                where: { id: studentId, parentId }
            });
            if (!student)
                return res.status(403).json({ error: 'Accès non autorisé à ce dossier' });
            const grades = await index_1.prisma.grade.findMany({
                where: { enrollment: { studentId } },
                orderBy: { createdAt: 'desc' }
            });
            return res.json(grades);
        }
        catch (error) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des notes' });
        }
    }
    // Consulter l'historique des paiements d'un enfant
    static async getPayments(req, res) {
        const { studentId } = req.params;
        try {
            // @ts-ignore
            const parentId = req.user.id;
            const payments = await index_1.prisma.payment.findMany({
                where: { enrollment: { studentId, student: { parentId } } },
                orderBy: { createdAt: 'desc' }
            });
            return res.json(payments);
        }
        catch (error) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des paiements' });
        }
    }
}
exports.ParentController = ParentController;
