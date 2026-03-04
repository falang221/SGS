"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret-default';
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Accès non autorisé' });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, ACCESS_TOKEN_SECRET);
        // Injecter l'utilisateur et le tenant dans la requête
        req.user = {
            id: payload.sub,
            tenantId: payload.tenantId,
            schoolId: payload.schoolId,
            role: payload.role,
            permissions: payload.permissions
        };
        // Vérifier si le tenant_id correspond au header (RLS Simulation)
        if (req.headers['x-tenant-id'] !== payload.tenantId) {
            return res.status(403).json({ error: 'Incohérence du Tenant ID' });
        }
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Session expirée ou invalide' });
    }
};
exports.authMiddleware = authMiddleware;
// Middleware RBAC (Rôles)
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Permission insuffisante' });
        }
        next();
    };
};
exports.checkRole = checkRole;
