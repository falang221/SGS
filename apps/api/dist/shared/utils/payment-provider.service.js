"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentProviderService = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("./logger");
class PaymentProviderService {
    /**
     * Intégration Wave Sénégal
     */
    static async createWaveSession(amount, paymentId) {
        const WAVE_API_KEY = process.env.WAVE_LAUNCH_API_KEY;
        const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
        try {
            const response = await axios_1.default.post('https://api.wave.com/v1/checkout/sessions', {
                amount,
                currency: 'XOF',
                error_url: `${process.env.FRONTEND_URL}/payment/error`,
                success_url: `${process.env.FRONTEND_URL}/payment/success`,
                backend_callback_url: `${BACKEND_URL}/api/v1/finance/webhooks/payment`,
                client_reference_id: paymentId,
            }, {
                headers: { Authorization: `Bearer ${WAVE_API_KEY}` }
            });
            return {
                id: response.data.id,
                url: response.data.wave_launch_url
            };
        }
        catch (error) {
            logger_1.logger.error('[Wave] Erreur création session:', error.response?.data || error.message);
            throw new Error('Échec de la connexion à Wave');
        }
    }
    /**
     * Intégration Orange Money Sénégal (Web Payment)
     */
    static async createOMSession(amount, paymentId) {
        // Note: Orange Money requiert une authentification OAuth2 préalable pour obtenir un token
        // Cette implémentation est schématique pour le prototype professionnel
        try {
            logger_1.logger.info(`[Orange Money] Initialisation paiement ${paymentId} de ${amount} FCFA`);
            // Simulation de l'appel API Orange (Partner API)
            return {
                id: `om-${paymentId}`,
                url: `https://orange-money-payment-mock.sn/pay?id=${paymentId}`
            };
        }
        catch (error) {
            logger_1.logger.error('[OM] Erreur création session:', error);
            throw new Error('Échec de la connexion à Orange Money');
        }
    }
}
exports.PaymentProviderService = PaymentProviderService;
