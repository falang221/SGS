"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const student_controller_1 = require("./student.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.post('/', student_controller_1.StudentController.create);
router.post('/:studentId/photo', upload.single('photo'), student_controller_1.StudentController.uploadPhoto);
router.get('/:studentId/photo-url', student_controller_1.StudentController.getPhotoUrl);
router.post('/import', (0, auth_middleware_1.checkRole)(['DIRECTEUR', 'SUPER_ADMIN']), upload.single('file'), student_controller_1.StudentController.importCSV);
router.get('/school/:schoolId', student_controller_1.StudentController.listBySchool);
router.post('/enroll', student_controller_1.StudentController.enroll);
exports.default = router;
