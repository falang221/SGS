import { Router } from 'express';
import { AttendanceController } from './attendance.controller';
import { authMiddleware, checkRole } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Pointage groupé
router.post('/bulk', checkRole(['ENSEIGNANT', 'DIRECTEUR', 'SUPER_ADMIN']), AttendanceController.submitBulk);

// Consultation & Stats
router.get('/stats/:schoolId', AttendanceController.getDailyStats);
router.get('/enrollment/:enrollmentId', AttendanceController.getHistoryByEnrollment);

export default router;
