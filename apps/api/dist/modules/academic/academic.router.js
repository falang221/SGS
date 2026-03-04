"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const academic_controller_1 = require("./academic.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// Classes
router.get('/classes/:schoolId', academic_controller_1.AcademicController.listClasses);
// Matières
router.post('/subjects', (0, auth_middleware_1.checkRole)(['DIRECTEUR', 'SUPER_ADMIN']), academic_controller_1.AcademicController.createSubject);
router.get('/subjects/:schoolId', academic_controller_1.AcademicController.listSubjects);
// Emploi du Temps
router.post('/timetable', (0, auth_middleware_1.checkRole)(['DIRECTEUR', 'SUPER_ADMIN']), academic_controller_1.AcademicController.createTimetableEntry);
router.get('/timetable/class/:classId', academic_controller_1.AcademicController.getTimetableByClass);
exports.default = router;
