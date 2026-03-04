import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SGS API - Système de Gestion Scolaire',
      version: '2.0.0',
      description: 'Documentation officielle de l\'API SGS. Cette API gère le multi-tenant, la scolarité, la notation et les finances.',
      contact: {
        name: 'Support Technique SGS',
        email: 'dev@sgs.sn',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001/api/v1',
        description: 'Serveur de Développement',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        tenantId: {
          type: 'apiKey',
          in: 'header',
          name: 'x-tenant-id',
          description: 'ID du Tenant pour l\'isolation des données',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
        tenantId: [],
      },
    ],
  },
  apis: ['./apps/api/src/modules/**/*.router.ts', './apps/api/src/index.ts'], // Chemin vers vos annotations
};

export const swaggerSpec = swaggerJsdoc(options);
