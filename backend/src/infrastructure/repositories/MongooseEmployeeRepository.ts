import type {
  Employee,
  EmployeeChanges,
  NewEmployee,
} from '../../domain/entities/employee.js';
import type { IEmployeeRepository } from '../../domain/repositories/IEmployeeRepository.js';
import { EmployeeModel } from '../database/mongoose/employee.model.js';

const toDomain = (document: {
  _id: { toString(): string };
  nombre: string;
  cargo: string;
  departamento: string;
  sueldo: number;
  createdAt: Date;
  updatedAt: Date;
}): Employee => ({
  id: document._id.toString(),
  nombre: document.nombre,
  cargo: document.cargo,
  departamento: document.departamento,
  sueldo: document.sueldo,
  createdAt: document.createdAt,
  updatedAt: document.updatedAt,
});

/** Adaptador de MongoDB para el puerto definido por IEmployeeRepository. */
export class MongooseEmployeeRepository implements IEmployeeRepository {
  async findAll(): Promise<readonly Employee[]> {
    const documents = await EmployeeModel.find().lean().exec();
    return documents.map(toDomain);
  }

  async create(data: NewEmployee): Promise<Employee> {
    const document = await EmployeeModel.create(data);
    return toDomain(document);
  }

  async update(id: string, changes: EmployeeChanges): Promise<Employee | null> {
    const document = await EmployeeModel.findByIdAndUpdate(id, changes, {
      new: true,
      runValidators: true,
    })
      .lean()
      .exec();

    return document ? toDomain(document) : null;
  }

  async delete(id: string): Promise<boolean> {
    const document = await EmployeeModel.findByIdAndDelete(id).lean().exec();
    return document !== null;
  }
}
