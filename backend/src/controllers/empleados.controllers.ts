import type { NextFunction, Request, Response } from 'express';
import type {
  EmployeeChanges,
  NewEmployee,
} from '../domain/entities/employee.js';
import type { IEmployeeRepository } from '../domain/repositories/IEmployeeRepository.js';

export class EmployeeController {
  constructor(private readonly employeeRepository: IEmployeeRepository) {}

  getEmployees = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const employees = await this.employeeRepository.findAll();
      res.json(employees);
    } catch (error) {
      next(error);
    }
  };

  addEmployee = async (
    req: Request<Record<string, never>, unknown, NewEmployee>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const employee = await this.employeeRepository.create(req.body);
      res.status(201).json(employee);
    } catch (error) {
      next(error);
    }
  };

  updateEmployee = async (
    req: Request<{ id: string }, unknown, EmployeeChanges>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const employee = await this.employeeRepository.update(req.params.id, req.body);

      if (!employee) {
        res.status(404).json({ message: 'Empleado no encontrado' });
        return;
      }

      res.json(employee);
    } catch (error) {
      next(error);
    }
  };

  deleteEmployee = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const deleted = await this.employeeRepository.delete(req.params.id);

      if (!deleted) {
        res.status(404).json({ message: 'Empleado no encontrado' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
