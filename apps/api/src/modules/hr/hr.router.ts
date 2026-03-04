import { Router } from 'express';
import { HRController } from './hr.controller';
import { authMiddleware, checkRole } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Seuls les directeurs et admins gèrent le personnel
router.post('/', checkRole(['DIRECTEUR', 'SUPER_ADMIN']), HRController.createStaff);
router.post('/payroll', checkRole(['DIRECTEUR', 'SUPER_ADMIN']), HRController.generatePayroll);

// Consultation
router.get('/school/:schoolId', HRController.listBySchool);
router.get('/stats/:schoolId', HRController.getStats);

export default router;
