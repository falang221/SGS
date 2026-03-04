"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.logger = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const shared_1 = require("@school-mgmt/shared");
Object.defineProperty(exports, "prisma", { enumerable: true, get: function () { return shared_1.prisma; } });
const logger_1 = require("./shared/utils/logger");
Object.defineProperty(exports, "logger", { enumerable: true, get: function () { return logger_1.logger; } });
const auth_router_1 = __importDefault(require("./modules/auth/auth.router"));
const academic_router_1 = __importDefault(require("./modules/academic/academic.router"));
const student_router_1 = __importDefault(require("./modules/students/student.router"));
const grade_router_1 = __importDefault(require("./modules/grades/grade.router"));
const finance_router_1 = __importDefault(require("./modules/finance/finance.router"));
const hr_router_1 = __importDefault(require("./modules/hr/hr.router"));
const attendance_router_1 = __importDefault(require("./modules/attendance/attendance.router"));
const parent_router_1 = __importDefault(require("./modules/parent/parent.router"));
const dashboard_router_1 = __importDefault(require("./modules/dashboard/dashboard.router"));
const school_router_1 = __importDefault(require("./modules/school/school.router"));
const error_middleware_1 = require("./middlewares/error.middleware");
const http_1 = require("http");
const socket_service_1 = require("./modules/notifications/socket.service");
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app); // Créer le serveur HTTP
const io = (0, socket_service_1.initSocket)(httpServer); // Initialiser Socket.io (Section 6.2)
const PORT = process.env.PORT || 3001;
// Middlewares de sécurité
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use((0, cors_1.default)({
    origin: true,
    credentials: true
}));
app.use(express_1.default.json());
// Logger middleware
app.use((req, res, next) => {
    logger_1.logger.info({ method: req.method, url: req.url, tenantId: req.headers['x-tenant-id'] });
    next();
});
// Middleware d'Audit (Section 3.2)
const auditMiddleware = async (req, res, next) => {
    const originalSend = res.send;
    res.send = function (body) {
        if (['POST', 'PUT', 'DELETE'].includes(req.method) && req.user) {
            shared_1.prisma.auditLog.create({
                data: {
                    userId: req.user.id,
                    action: `${req.method} ${req.originalUrl}`,
                    resource: req.path.split('/')[3] || 'unknown',
                    ipAddress: req.ip,
                    newValue: req.body
                }
            }).catch((err) => logger_1.logger.error('AuditLog Error:', err));
        }
        return originalSend.apply(res, arguments);
    };
    next();
};
// Route de santé (Exclue du tenant-check)
app.get('/api/v1/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// --- ROUTES PUBLIQUES ---
app.use('/api/v1/auth', auth_router_1.default);
app.use('/api/v1/finance/webhooks', finance_router_1.default); // Inclusion du webhook finance sans tenant-id
// --- MIDDLEWARE MULTI-TENANT (Vérification obligatoire pour le reste) ---
app.use((req, res, next) => {
    const tenantId = req.headers['x-tenant-id'];
    if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID est requis (x-tenant-id)' });
    }
    req.tenantId = tenantId;
    next();
});
// --- ROUTES PROTÉGÉES ---
app.use(auditMiddleware); // Audit systématique des actions mutables
app.use('/api/v1/students', student_router_1.default);
app.use('/api/v1/academic', academic_router_1.default);
app.use('/api/v1/grades', grade_router_1.default);
app.use('/api/v1/finance', finance_router_1.default);
app.use('/api/v1/hr', hr_router_1.default);
app.use('/api/v1/attendance', attendance_router_1.default);
app.use('/api/v1/parent', parent_router_1.default);
app.use('/api/v1/dashboard', dashboard_router_1.default);
app.use('/api/v1/school', school_router_1.default);
// --- GESTION DES ERREURS GLOBALE ---
app.use(error_middleware_1.errorHandler);
httpServer.listen(Number(PORT), '0.0.0.0', () => {
    logger_1.logger.info(`🚀 Serveur API & Socket.io Gestion Scolaire démarré sur le port ${PORT}`);
});
