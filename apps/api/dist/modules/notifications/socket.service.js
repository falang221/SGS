"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const logger_1 = require("../../shared/utils/logger");
let io;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true
        }
    });
    io.on('connection', (socket) => {
        logger_1.logger.info(`Nouvelle connexion temps réel : ${socket.id}`);
        // Identification par Tenant (Section 1.1)
        socket.on('join', (tenantId) => {
            socket.join(tenantId);
            logger_1.logger.info(`Socket ${socket.id} a rejoint le canal tenant : ${tenantId}`);
        });
        socket.on('disconnect', () => {
            logger_1.logger.info(`Déconnexion temps réel : ${socket.id}`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io)
        throw new Error("Socket.io n'est pas initialisé");
    return io;
};
exports.getIO = getIO;
