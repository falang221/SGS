import { Router } from 'express';
import { TenantController } from './tenant.controller';
import { authMiddleware, checkRole } from '../../middlewares/auth.middleware';

const router = Router();

// Routes réservées exclusivement au SUPER_ADMIN
router.use(authMiddleware);
router.use(checkRole(['SUPER_ADMIN']));

router.get('/', TenantController.list);
router.post('/create', TenantController.create);
router.post('/schools/add', TenantController.addSchool);

export default router;
