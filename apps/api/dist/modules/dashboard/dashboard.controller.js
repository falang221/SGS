"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_1 = require("../../services/dashboard.service");
const errors_1 = require("../../shared/utils/errors");
class DashboardController {
    static async getStats(req, res) {
        try {
            if (!req.user)
                throw new errors_1.UnauthorizedError();
            const stats = await dashboard_service_1.DashboardService.getStats(req.user.tenantId);
            return res.json(stats);
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({ error: error.message || 'Erreur lors du calcul des statistiques' });
        }
    }
}
exports.DashboardController = DashboardController;
