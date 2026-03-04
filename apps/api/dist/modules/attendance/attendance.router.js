"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attendance_controller_1 = require("./attendance.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// Pointage groupé
router.post('/bulk', (0, auth_middleware_1.checkRole)(['ENSEIGNANT', 'DIRECTEUR', 'SUPER_ADMIN']), attendance_controller_1.AttendanceController.submitBulk);
// Consultation & Stats
router.get('/stats/:schoolId', attendance_controller_1.AttendanceController.getDailyStats);
router.get('/enrollment/:enrollmentId', attendance_controller_1.AttendanceController.getHistoryByEnrollment);
exports.default = router;
