import dotenv from 'dotenv';
import { createServer } from 'http';
import { prisma } from '@school-mgmt/shared';
import { logger } from './shared/utils/logger';
import { initSocket } from './modules/notifications/socket.service';
import { validateRuntimeEnv } from './shared/config/runtime-env';
import { createApp } from './app';

dotenv.config();
const runtimeEnv = validateRuntimeEnv(process.env);

const app = createApp();
const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(runtimeEnv.port, '0.0.0.0', () => {
  logger.info(`🚀 Serveur API & Socket.io Gestion Scolaire démarré sur le port ${runtimeEnv.port}`);
});

export { app, httpServer, logger, prisma };
