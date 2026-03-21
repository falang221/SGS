import { Router } from 'express';
import { FinanceController } from './finance.controller';
import { authMiddleware, checkRole } from '../../middlewares/auth.middleware';

const router = Router();

// Routes protégées
router.use(authMiddleware);

// Seuls les comptables et directeurs peuvent enregistrer des paiements
router.post('/', checkRole(['COMPTABLE', 'DIRECTEUR', 'SUPER_ADMIN']), FinanceController.initiate);
router.post('/reminders', checkRole(['COMPTABLE', 'DIRECTEUR', 'SUPER_ADMIN']), FinanceController.sendReminders);

// Consultation des paiements (Parents, Staff)
router.get('/stats', checkRole(['COMPTABLE', 'DIRECTEUR', 'SUPER_ADMIN']), FinanceController.getStats);
router.get('/enrollment/:enrollmentId', FinanceController.listByEnrollment);

export default router;
