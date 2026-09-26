import type {
  Employee,
  EmployeeChanges,
  NewEmployee,
} from '../entities/employee.js';

export interface IEmployeeRepository {
  findById(id: string): Promise<Employee | null>;
  findAll(): Promise<readonly Employee[]>;
  create(data: NewEmployee): Promise<Employee>;
  update(id: string, changes: EmployeeChanges): Promise<Employee | null>;
  delete(id: string): Promise<boolean>;
}
