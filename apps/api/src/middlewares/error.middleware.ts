import { Request, Response, NextFunction } from 'express';
import { logger } from '../shared/utils/logger';
import { AppError } from '../shared/utils/errors';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log de l'erreur
  logger.error({
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
