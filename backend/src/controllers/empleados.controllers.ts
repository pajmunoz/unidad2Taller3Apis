import type { NextFunction, Request, Response } from 'express';
import type { IEmployeeRepository } from '../domain/repositories/IEmployeeRepository.js';
import type {
  CreateEmployeeDto,
  EmployeeIdParamsDto,
  UpdateEmployeeDto,
} from '../dtos/employee.dto.js';
import { AppError } from '../shared/errors/AppError.js';
import { sendSuccess } from '../shared/http/api-response.js';

export class EmployeeController {
  constructor(private readonly employeeRepository: IEmployeeRepository) {}

  getEmployees = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const employees = await this.employeeRepository.findAll();
      sendSuccess(res, employees, 'Empleados obtenidos correctamente');
    } catch (error) {
      next(error);
    }
  };

  addEmployee = async (
    req: Request<Record<string, never>, unknown, CreateEmployeeDto>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const employee = await this.employeeRepository.create(req.body);
      sendSuccess(res, employee, 'Empleado creado correctamente', 201);
    } catch (error) {
      next(error);
    }
  };

  updateEmployee = async (
    req: Request<EmployeeIdParamsDto, unknown, UpdateEmployeeDto>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const employee = await this.employeeRepository.update(req.params.id, req.body);

      if (!employee) {
        throw new AppError('Empleado no encontrado', 404);
      }

      sendSuccess(res, employee, 'Empleado actualizado correctamente');
    } catch (error) {
      next(error);
    }
  };

  deleteEmployee = async (
    req: Request<EmployeeIdParamsDto>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const deleted = await this.employeeRepository.delete(req.params.id);

      if (!deleted) {
        throw new AppError('Empleado no encontrado', 404);
      }

      sendSuccess(res, null, 'Empleado eliminado correctamente');
    } catch (error) {
      next(error);
    }
  };
}
