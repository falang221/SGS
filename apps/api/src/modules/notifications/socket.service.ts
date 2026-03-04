import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { logger } from '../../shared/utils/logger';

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Nouvelle connexion temps réel : ${socket.id}`);
    
    // Identification par Tenant (Section 1.1)
    socket.on('join', (tenantId: string) => {
      socket.join(tenantId);
      logger.info(`Socket ${socket.id} a rejoint le canal tenant : ${tenantId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Déconnexion temps réel : ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io n'est pas initialisé");
  return io;
};
