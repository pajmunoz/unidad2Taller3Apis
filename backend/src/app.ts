import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import type { IEmployeeRepository } from './domain/repositories/IEmployeeRepository.js';
import { errorHandler, notFoundHandler } from './middlewares/error-handler.middleware.js';
import { createEmployeeRouter } from './routes/empleados.routes.js';
import { sendSuccess } from './shared/http/api-response.js';

export const createApp = (employeeRepository: IEmployeeRepository) => {
  const app = express();
  const employeeRoutes = createEmployeeRouter(employeeRepository);

  app.use(morgan('dev'));
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    sendSuccess(res, { status: 'ok' }, 'Servidor disponible');
  });

  app.use('/api/v1/empleados', employeeRoutes);
  app.use('/api/v1/employees', employeeRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
