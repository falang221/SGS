import { Router } from 'express';
import { SchoolController } from './school.controller';
import { authMiddleware, checkRole } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/tenant/:tenantId', SchoolController.listByTenant);
router.get('/:schoolId', SchoolController.getProfile);
router.get('/:schoolId/years', SchoolController.getYears);
router.put('/:schoolId', checkRole(['DIRECTEUR', 'SUPER_ADMIN']), SchoolController.updateConfig);

export default router;
