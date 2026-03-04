"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceController = void 0;
const finance_dto_1 = require("./finance.dto");
const finance_service_1 = require("../../services/finance.service");
const errors_1 = require("../../shared/utils/errors");
class FinanceController {
    static async sendReminders(req, res) {
        const { schoolId } = req.body;
        if (!req.user)
            throw new errors_1.UnauthorizedError();
        try {
            const count = await finance_service_1.FinanceService.sendReminders(schoolId, req.user.tenantId);
            return res.json({ message: `${count} rappels envoyés.` });
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    static async initiate(req, res) {
        try {
            const data = finance_dto_1.PaymentInitiateSchema.parse(req.body);
            if (!req.user)
                throw new errors_1.UnauthorizedError();
            const { payment, checkoutUrl } = await finance_service_1.FinanceService.initiatePayment(data, req.user.id, req.ip || '0.0.0.0');
            return res.status(201).json({
                payment,
                checkoutUrl,
                message: data.method === 'CASH' ? 'Paiement enregistré avec succès.' : 'Redirection vers la passerelle de paiement.'
            });
        }
        catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    static async handleWebhook(req, res) {
        try {
            const signature = req.headers['x-webhook-signature'];
            const data = finance_dto_1.WebhookPaymentSchema.parse(req.body);
            await finance_service_1.FinanceService.handleWebhook(data, signature);
            return res.status(200).send('OK');
        }
        catch (error) {
            return res.status(400).json({ error: error.message || 'Données de webhook invalides' });
        }
    }
    static async listByEnrollment(req, res) {
        const { enrollmentId } = req.params;
        try {
            const payments = await finance_service_1.FinanceService.getPaymentsByEnrollment(enrollmentId);
            return res.json(payments);
        }
        catch (error) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des paiements' });
        }
    }
    static async getStats(req, res) {
        try {
            if (!req.user)
                throw new errors_1.UnauthorizedError();
            const stats = await finance_service_1.FinanceService.getFinanceStats(req.user.tenantId);
            return res.json(stats);
        }
        catch (error) {
            return res.status(500).json({ error: error.message || 'Erreur lors du calcul des statistiques financières' });
        }
    }
}
exports.FinanceController = FinanceController;
