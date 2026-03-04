"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hr_controller_1 = require("./hr.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// Seuls les directeurs et admins gèrent le personnel
router.post('/', (0, auth_middleware_1.checkRole)(['DIRECTEUR', 'SUPER_ADMIN']), hr_controller_1.HRController.createStaff);
router.post('/payroll', (0, auth_middleware_1.checkRole)(['DIRECTEUR', 'SUPER_ADMIN']), hr_controller_1.HRController.generatePayroll);
// Consultation
router.get('/school/:schoolId', hr_controller_1.HRController.listBySchool);
router.get('/stats/:schoolId', hr_controller_1.HRController.getStats);
exports.default = router;
