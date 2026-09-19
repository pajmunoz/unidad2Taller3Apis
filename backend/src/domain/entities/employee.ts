export interface Employee {
  id: string;
  nombre: string;
  cargo: string;
  departamento: string;
  sueldo: number;
  createdAt: Date;
  updatedAt: Date;
}

export type NewEmployee = Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>;

export type EmployeeChanges = Partial<NewEmployee>;
