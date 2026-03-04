import { Router } from 'express';
import { HRController } from './hr.controller';
import { authMiddleware, checkRole } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Gestion du personnel
router.post('/create', checkRole(['DIRECTEUR', 'SUPER_ADMIN']), HRController.createStaff);
router.put('/:id', checkRole(['DIRECTEUR', 'SUPER_ADMIN']), HRController.updateStaff);
router.delete('/:id', checkRole(['DIRECTEUR', 'SUPER_ADMIN']), HRController.deleteStaff);

// Consultation
router.get('/school/:schoolId', HRController.listBySchool);
router.get('/stats/:schoolId', HRController.getStats);

// Paie
router.post('/payroll', checkRole(['DIRECTEUR', 'SUPER_ADMIN', 'COMPTABLE']), HRController.generatePayroll);

export default router;
