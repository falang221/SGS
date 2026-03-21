import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@school-mgmt/shared';
import { logger } from '../../shared/utils/logger';
import { AuditService } from '../../shared/utils/audit.service';
import { LoginSchema, RegisterSchema } from './auth.dto';

function getAccessTokenSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET est requis.');
  }

  return secret;
}

function getRefreshTokenSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET est requis.');
  }

  return secret;
}

function signAccessToken(user: {
  id: string;
  tenantId: string;
  role: string;
  permissions: string[];
}) {
  return jwt.sign(
    {
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      permissions: user.permissions,
    },
    getAccessTokenSecret(),
    { expiresIn: '15m' },
  );
}

function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {};

  return cookieHeader.split(';').reduce<Record<string, string>>((cookies, part) => {
    const [rawName, ...rawValue] = part.trim().split('=');
    if (!rawName) return cookies;

    cookies[rawName] = decodeURIComponent(rawValue.join('='));
    return cookies;
  }, {});
}

export class AuthController {
  
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = LoginSchema.parse(req.body);

      const user = await prisma.user.findFirst({
        where: {
          email,
          deletedAt: null,
        },
        include: { tenant: true }
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Identifiants invalides' });
      }

      // Génération des tokens
      const accessToken = signAccessToken(user);

      const refreshToken = jwt.sign(
        { sub: user.id, tenantId: user.tenantId },
        getRefreshTokenSecret(),
        { expiresIn: '7d' }
      );

      // Cookie pour le refresh token (HttpOnly Secure)
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
      });

      // Audit Log: Connexion réussie
      await AuditService.log({
        userId: user.id,
        action: 'USER_LOGIN',
        resource: 'AUTH',
        ipAddress: req.ip
      });

      logger.info(`Utilisateur ${user.email} connecté au tenant ${user.tenantId}`);

      return res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId
        },
        accessToken
      });

    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Erreur lors de la connexion' });
    }
  }

  static async refresh(req: Request, res: Response) {
    try {
      const cookies = parseCookies(req.headers.cookie);
      const refreshToken = cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token manquant' });
      }

      const payload = jwt.verify(refreshToken, getRefreshTokenSecret()) as {
        sub: string;
        tenantId: string;
      };

      const user = await prisma.user.findFirst({
        where: {
          id: payload.sub,
          tenantId: payload.tenantId,
          deletedAt: null,
        },
      });

      if (!user) {
        return res.status(401).json({ error: 'Utilisateur introuvable' });
      }

      return res.json({
        accessToken: signAccessToken(user),
      });
    } catch (error: any) {
      return res.status(401).json({ error: error.message || 'Refresh token invalide' });
    }
  }

  static async register(req: Request, res: Response) {
     try {
       const data = RegisterSchema.parse(req.body);

       // 1. Création du Tenant atomique
       const result = await prisma.$transaction(async (tx: any) => {
         const tenant = await tx.tenant.create({
           data: {
             name: data.tenantName,
             slug: data.tenantName.toLowerCase().replace(/ /g, '-'),
           }
         });

         const hashedPassword = await bcrypt.hash(data.password, 12);

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
       await AuditService.log({
         userId: result.user.id,
         action: 'TENANT_REGISTER',
         resource: 'TENANT',
         newValue: { tenantId: result.tenant.id, name: result.tenant.name },
         ipAddress: req.ip
       });

       return res.status(201).json(result);
     } catch (error: any) {
        return res.status(400).json({ error: error.message || 'Erreur lors de la création du compte' });
     }
  }
}
