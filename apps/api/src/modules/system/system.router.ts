import { Router } from 'express';
import { SystemController } from './system.controller';
import { authMiddleware, checkRole } from '../../middlewares/auth.middleware';

const router = Router();

// Accès exclusif au SUPER_ADMIN pour les réglages de plateforme
router.use(authMiddleware);
router.use(checkRole(['SUPER_ADMIN']));

router.get('/settings', SystemController.getSettings);
router.post('/settings', SystemController.updateSetting);
router.get('/status', SystemController.getStatus);

export default router;
