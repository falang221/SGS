"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_controller_1 = require("./auth.controller");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const setup_1 = require("../../test/setup");
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
describe('AuthController', () => {
    let req;
    let res;
    let jsonMock;
    let statusMock;
    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnThis();
        req = {
            body: {
                email: 'admin@ecole.sn',
                password: 'admin12345'
            }
        };
        res = {
            json: jsonMock,
            status: statusMock,
            cookie: jest.fn()
        };
        jest.clearAllMocks();
    });
    describe('login', () => {
        it('doit se connecter avec succès et retourner un token', async () => {
            const mockUser = {
                id: 'user-1',
                email: 'admin@ecole.sn',
                password: 'hashed-password',
                role: 'DIRECTEUR',
                tenantId: 'tenant-1',
                permissions: []
            };
            // @ts-ignore
            setup_1.prismaMock.user.findUnique.mockResolvedValue(mockUser);
            bcryptjs_1.default.compare.mockResolvedValue(true);
            jsonwebtoken_1.default.sign.mockReturnValue('mock-token');
            await auth_controller_1.AuthController.login(req, res);
            expect(statusMock).not.toHaveBeenCalledWith(401);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
                accessToken: 'mock-token',
                user: expect.objectContaining({
                    email: 'admin@ecole.sn'
                })
            }));
        });
        it('doit retourner 401 si les identifiants sont incorrects', async () => {
            // @ts-ignore
            setup_1.prismaMock.user.findUnique.mockResolvedValue(null);
            await auth_controller_1.AuthController.login(req, res);
            expect(statusMock).toHaveBeenCalledWith(401);
            expect(jsonMock).toHaveBeenCalledWith({ error: 'Identifiants invalides' });
        });
        it('doit retourner 401 si le mot de passe ne correspond pas', async () => {
            const mockUser = {
                id: 'user-1',
                email: 'admin@ecole.sn',
                password: 'hashed-password'
            };
            // @ts-ignore
            setup_1.prismaMock.user.findUnique.mockResolvedValue(mockUser);
            bcryptjs_1.default.compare.mockResolvedValue(false);
            await auth_controller_1.AuthController.login(req, res);
            expect(statusMock).toHaveBeenCalledWith(401);
            expect(jsonMock).toHaveBeenCalledWith({ error: 'Identifiants invalides' });
        });
    });
});
