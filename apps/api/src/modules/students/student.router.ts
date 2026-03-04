import { Router } from 'express';
import { StudentController } from './student.controller';
import { authMiddleware, checkRole } from '../../middlewares/auth.middleware';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.use(authMiddleware);

router.post('/', StudentController.create);
router.post('/:studentId/photo', upload.single('photo'), StudentController.uploadPhoto);
router.get('/:studentId/photo-url', StudentController.getPhotoUrl);
router.post('/import', checkRole(['DIRECTEUR', 'SUPER_ADMIN']), upload.single('file'), StudentController.importCSV);
router.get('/school/:schoolId', StudentController.listBySchool);
router.post('/enroll', StudentController.enroll);

export default router;
