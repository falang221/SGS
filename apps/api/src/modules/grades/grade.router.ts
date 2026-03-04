import { Router } from 'express';
import { GradeController } from './grade.controller';
import { authMiddleware, checkRole } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Saisie de notes
router.post('/submit', checkRole(['ENSEIGNANT', 'DIRECTEUR', 'SUPER_ADMIN']), GradeController.submit);

// Consultation
router.get('/enrollment/:enrollmentId', GradeController.listByEnrollment);
router.get('/class/:classId/subject/:subjectId', GradeController.listByClassAndSubject);

// Bulletins
router.post('/reports/generate', checkRole(['DIRECTEUR', 'SUPER_ADMIN']), GradeController.generateReports);

export default router;
