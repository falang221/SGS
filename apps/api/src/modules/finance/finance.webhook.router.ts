import { Router } from 'express';
import { FinanceController } from './finance.controller';

const router = Router();

// Route publique pour les Webhooks (Wave/Orange Money) - Vérification HMAC à ajouter
router.post('/payment', FinanceController.handleWebhook);

export default router;
