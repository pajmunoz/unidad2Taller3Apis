import { Router } from 'express';
import { EmployeeController } from '../controllers/empleados.controllers.js';
import type { IEmployeeRepository } from '../domain/repositories/IEmployeeRepository.js';
import {
  createEmployeeBodySchema,
  employeeIdParamsSchema,
  updateEmployeeBodySchema,
} from '../dtos/employee.dto.js';
import { validateRequest } from '../middlewares/validate-request.middleware.js';

export const createEmployeeRouter = (
  employeeRepository: IEmployeeRepository,
): Router => {
  const router = Router();
  const controller = new EmployeeController(employeeRepository);

  router.get('/', controller.getEmployees);
  router.post(
    '/',
    validateRequest({ body: createEmployeeBodySchema }),
    controller.addEmployee,
  );
  router.put(
    '/:id',
    validateRequest({ params: employeeIdParamsSchema, body: updateEmployeeBodySchema }),
    controller.updateEmployee,
  );
  router.delete(
    '/:id',
    validateRequest({ params: employeeIdParamsSchema }),
    controller.deleteEmployee,
  );

  return router;
};
