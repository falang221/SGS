import { Router } from 'express';
import { AcademicController } from './academic.controller';
import { authMiddleware, checkRole } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Classes
router.get('/classes/:schoolId', AcademicController.listClasses);

// Matières
router.post('/subjects', checkRole(['DIRECTEUR', 'SUPER_ADMIN']), AcademicController.createSubject);
router.get('/subjects/:schoolId', AcademicController.listSubjects);

// Emploi du Temps
router.post('/timetable', checkRole(['DIRECTEUR', 'SUPER_ADMIN']), AcademicController.createTimetableEntry);
router.get('/timetable/class/:classId', AcademicController.getTimetableByClass);

export default router;
