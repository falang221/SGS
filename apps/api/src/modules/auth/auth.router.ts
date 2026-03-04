import { Router } from 'express';
import { AuthController } from './auth.controller';

const router = Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentification
 *     summary: Se connecter à l'application
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@ecole.sn
 *               password:
 *                 type: string
 *                 example: admin12345
 *     responses:
 *       200:
 *         description: Authentification réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                 accessToken:
 *                   type: string
 */
router.post('/login', AuthController.login);

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - Authentification
 *     summary: Créer un nouveau compte utilisateur (Super Admin)
 */
router.post('/register', AuthController.register);

export default router;
