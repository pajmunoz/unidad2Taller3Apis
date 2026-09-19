import { Router } from 'express';
import { EmployeeController } from '../controllers/empleados.controllers.js';
import type { IEmployeeRepository } from '../domain/repositories/IEmployeeRepository.js';

export const createEmployeeRouter = (
  employeeRepository: IEmployeeRepository,
): Router => {
  const router = Router();
  const controller = new EmployeeController(employeeRepository);

  router.get('/', controller.getEmployees);
  router.post('/', controller.addEmployee);
  router.put('/:id', controller.updateEmployee);
  router.delete('/:id', controller.deleteEmployee);

  return router;
};
