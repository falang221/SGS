"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("../shared/utils/logger");
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    // Log de l'erreur
    logger_1.logger.error({
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        tenantId: req.tenantId,
        userId: req.user?.id
    });
    if (process.env.NODE_ENV === 'development') {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }
    // Erreur de production (ne pas exposer la stack)
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
    // Erreurs programmatiques ou inconnues
    return res.status(500).json({
        status: 'error',
        message: 'Une erreur inattendue est survenue'
    });
};
exports.errorHandler = errorHandler;
