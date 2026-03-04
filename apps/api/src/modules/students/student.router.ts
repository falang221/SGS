import { Router } from 'express';
import { StudentController } from './student.controller';
import { authMiddleware, checkRole } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /students/school/{schoolId}:
 *   get:
 *     tags:
 *       - Élèves
 *     summary: Liste tous les élèves d'un établissement
 *     parameters:
 *       - in: path
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des élèves récupérée avec succès
 */
router.get('/school/:schoolId', StudentController.listBySchool);

/**
 * @openapi
 * /students/create:
 *   post:
 *     tags:
 *       - Élèves
 *     summary: Inscrire un nouvel élève
 *     security:
 *       - bearerAuth: []
 *       - tenantId: []
 */
router.post('/create', checkRole(['DIRECTEUR', 'SUPER_ADMIN', 'COMPTABLE']), StudentController.create);

router.post('/import-csv', checkRole(['DIRECTEUR', 'SUPER_ADMIN']), StudentController.importCSV);

export default router;
