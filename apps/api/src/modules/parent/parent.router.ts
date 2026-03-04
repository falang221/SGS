import { Router } from 'express';
import { ParentController } from './parent.controller';
import { authMiddleware, checkRole } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.use(checkRole(['PARENT', 'SUPER_ADMIN']));

router.get('/children', ParentController.getChildren);
router.get('/grades/:studentId', ParentController.getGrades);
router.get('/payments/:studentId', ParentController.getPayments);

export default router;
