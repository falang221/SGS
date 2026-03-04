import axios from 'axios';
import { logger } from './logger';

export interface PaymentSessionResponse {
  id: string;
  url: string;
}

export class PaymentProviderService {
  
  /**
   * Intégration Wave Sénégal
   */
  static async createWaveSession(amount: number, paymentId: string): Promise<PaymentSessionResponse> {
    const WAVE_API_KEY = process.env.WAVE_LAUNCH_API_KEY;
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

    try {
      const response = await axios.post(
        'https://api.wave.com/v1/checkout/sessions',
        {
          amount,
          currency: 'XOF',
          error_url: `${process.env.FRONTEND_URL}/payment/error`,
          success_url: `${process.env.FRONTEND_URL}/payment/success`,
          backend_callback_url: `${BACKEND_URL}/api/v1/finance/webhooks/payment`,
          client_reference_id: paymentId,
        },
        {
          headers: { Authorization: `Bearer ${WAVE_API_KEY}` }
        }
      );

      return {
        id: response.data.id,
        url: response.data.wave_launch_url
      };
    } catch (error: any) {
      logger.error('[Wave] Erreur création session:', error.response?.data || error.message);
      throw new Error('Échec de la connexion à Wave');
    }
  }

  /**
   * Intégration Orange Money Sénégal (Web Payment)
   */
  static async createOMSession(amount: number, paymentId: string): Promise<PaymentSessionResponse> {
    // Note: Orange Money requiert une authentification OAuth2 préalable pour obtenir un token
    // Cette implémentation est schématique pour le prototype professionnel
    try {
      logger.info(`[Orange Money] Initialisation paiement ${paymentId} de ${amount} FCFA`);
      
      // Simulation de l'appel API Orange (Partner API)
      return {
        id: `om-${paymentId}`,
        url: `https://orange-money-payment-mock.sn/pay?id=${paymentId}`
      };
    } catch (error) {
      logger.error('[OM] Erreur création session:', error);
      throw new Error('Échec de la connexion à Orange Money');
    }
  }
}
