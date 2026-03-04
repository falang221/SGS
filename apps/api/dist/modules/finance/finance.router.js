"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const finance_controller_1 = require("./finance.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Route publique pour les Webhooks (Wave/Orange Money) - Vérification HMAC à ajouter
router.post('/webhooks/payment', finance_controller_1.FinanceController.handleWebhook);
// Routes protégées
router.use(auth_middleware_1.authMiddleware);
// Seuls les comptables et directeurs peuvent enregistrer des paiements
router.post('/', (0, auth_middleware_1.checkRole)(['COMPTABLE', 'DIRECTEUR', 'SUPER_ADMIN']), finance_controller_1.FinanceController.initiate);
router.post('/reminders', (0, auth_middleware_1.checkRole)(['COMPTABLE', 'DIRECTEUR', 'SUPER_ADMIN']), finance_controller_1.FinanceController.sendReminders);
// Consultation des paiements (Parents, Staff)
router.get('/stats', (0, auth_middleware_1.checkRole)(['COMPTABLE', 'DIRECTEUR', 'SUPER_ADMIN']), finance_controller_1.FinanceController.getStats);
router.get('/enrollment/:enrollmentId', finance_controller_1.FinanceController.listByEnrollment);
exports.default = router;
