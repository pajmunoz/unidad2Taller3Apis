import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../shared/errors/AppError.js';
import { sendError } from '../shared/http/api-response.js';

export const notFoundHandler: RequestHandler = (req, _res, next): void => {
  next(new AppError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next): void => {
  if (error instanceof ZodError) {
    const errors = error.issues.map((issue) => ({
      field: issue.path.join('.') || 'request',
      message: issue.message,
    }));

    sendError(res, 'La solicitud contiene datos inválidos', 400, errors);
    return;
  }

  if (error instanceof AppError) {
    sendError(res, error.message, error.statusCode);
    return;
  }

  if (error instanceof SyntaxError && 'status' in error && error.status === 400) {
    sendError(res, 'El cuerpo de la solicitud no contiene JSON válido', 400);
    return;
  }

  console.error('❌ [Unhandled error]:', error);
  sendError(res, 'Ocurrió un error interno en el servidor', 500);
};
