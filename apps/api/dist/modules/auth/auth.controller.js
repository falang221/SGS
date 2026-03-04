"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const shared_1 = require("@school-mgmt/shared");
const logger_1 = require("../../shared/utils/logger");
const audit_service_1 = require("../../shared/utils/audit.service");
const auth_dto_1 = require("./auth.dto");
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret-default';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-default';
class AuthController {
    static async login(req, res) {
        try {
            const { email, password } = auth_dto_1.LoginSchema.parse(req.body);
            const user = await shared_1.prisma.user.findUnique({
                where: { email },
                include: { tenant: true }
            });
            if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
                return res.status(401).json({ error: 'Identifiants invalides' });
            }
            // Génération des tokens
            const accessToken = jsonwebtoken_1.default.sign({
                sub: user.id,
                tenantId: user.tenantId,
                role: user.role,
                permissions: user.permissions
            }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
            const refreshToken = jsonwebtoken_1.default.sign({ sub: user.id, tenantId: user.tenantId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
            // Cookie pour le refresh token (HttpOnly Secure)
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
            });
            // Audit Log: Connexion réussie
            await audit_service_1.AuditService.log({
                userId: user.id,
                action: 'USER_LOGIN',
                resource: 'AUTH',
                ipAddress: req.ip
            });
            logger_1.logger.info(`Utilisateur ${user.email} connecté au tenant ${user.tenantId}`);
            return res.json({
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    tenantId: user.tenantId
                },
                accessToken
            });
        }
        catch (error) {
            return res.status(400).json({ error: error.message || 'Erreur lors de la connexion' });
        }
    }
    static async register(req, res) {
        try {
            const data = auth_dto_1.RegisterSchema.parse(req.body);
            // 1. Création du Tenant atomique
            const result = await shared_1.prisma.$transaction(async (tx) => {
                const tenant = await tx.tenant.create({
                    data: {
                        name: data.tenantName,
                        slug: data.tenantName.toLowerCase().replace(/ /g, '-'),
                    }
                });
                const hashedPassword = await bcryptjs_1.default.hash(data.password, 12);
                const user = await tx.user.create({
                    data: {
                        email: data.email,
                        password: hashedPassword,
                        role: data.role,
                        tenantId: tenant.id
                    }
                });
                return { tenant, user };
            });
            // Audit Log: Inscription nouveau tenant
            await audit_service_1.AuditService.log({
                userId: result.user.id,
                action: 'TENANT_REGISTER',
                resource: 'TENANT',
                newValue: { tenantId: result.tenant.id, name: result.tenant.name },
                ipAddress: req.ip
            });
            return res.status(201).json(result);
        }
        catch (error) {
            return res.status(400).json({ error: error.message || 'Erreur lors de la création du compte' });
        }
    }
}
exports.AuthController = AuthController;
