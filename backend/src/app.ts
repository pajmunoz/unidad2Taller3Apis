import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import type { IEmployeeRepository } from './domain/repositories/IEmployeeRepository.js';
import { createEmployeeRouter } from './routes/empleados.routes.js';

export const createApp = (employeeRepository: IEmployeeRepository) => {
  const app = express();
  const employeeRoutes = createEmployeeRouter(employeeRepository);

  app.use(morgan('dev'));
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/v1/empleados', employeeRoutes);
  app.use('/api/v1/employees', employeeRoutes);

  return app;
};
