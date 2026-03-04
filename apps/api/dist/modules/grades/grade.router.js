"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const grade_controller_1 = require("./grade.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// Saisie de notes
router.post('/submit', (0, auth_middleware_1.checkRole)(['ENSEIGNANT', 'DIRECTEUR', 'SUPER_ADMIN']), grade_controller_1.GradeController.submit);
// Consultation
router.get('/enrollment/:enrollmentId', grade_controller_1.GradeController.listByEnrollment);
router.get('/class/:classId/subject/:subjectId', grade_controller_1.GradeController.listByClassAndSubject);
// Bulletins
router.post('/reports/generate', (0, auth_middleware_1.checkRole)(['DIRECTEUR', 'SUPER_ADMIN']), grade_controller_1.GradeController.generateReports);
exports.default = router;
