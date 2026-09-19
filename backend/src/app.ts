import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './docs/openapi.js';
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

  app.get('/api-docs.json', (_req, res) => {
    res.json(openApiDocument);
  });
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      customSiteTitle: 'Gestión de empleados API',
      swaggerOptions: {
        displayRequestDuration: true,
        persistAuthorization: true,
      },
    }),
  );

  app.get('/health', (_req, res) => {
    sendSuccess(res, { status: 'ok' }, 'Servidor disponible');
  });

  app.use('/api/v1/empleados', employeeRoutes);
  app.use('/api/v1/employees', employeeRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
