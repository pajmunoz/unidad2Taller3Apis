import type {
  Employee,
  EmployeeChanges,
  NewEmployee,
} from '../entities/employee.js';

/**
 * Puerto de persistencia definido por el dominio.
 * Ninguna capa externa (Mongoose, SQL, memoria, etc.) forma parte del contrato.
 */
export interface IEmployeeRepository {
  findAll(): Promise<readonly Employee[]>;
  create(data: NewEmployee): Promise<Employee>;
  update(id: string, changes: EmployeeChanges): Promise<Employee | null>;
  delete(id: string): Promise<boolean>;
}
