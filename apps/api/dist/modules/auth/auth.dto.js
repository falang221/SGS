"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterSchema = exports.LoginSchema = void 0;
const zod_1 = require("zod");
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email invalide'),
    password: zod_1.z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});
exports.RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    tenantName: zod_1.z.string().min(3),
    role: zod_1.z.enum(['SUPER_ADMIN', 'DIRECTEUR', 'ENSEIGNANT', 'COMPTABLE', 'PARENT', 'STUDENT']),
});
