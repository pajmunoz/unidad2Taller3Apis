import { Schema, model } from 'mongoose';
import type { NewEmployee } from '../../../domain/entities/employee.js';

export interface EmployeeDocument extends NewEmployee {
  createdAt: Date;
  updatedAt: Date;
}

const employeeSchema = new Schema<EmployeeDocument>(
  {
    nombre: { type: String, required: true, trim: true },
    cargo: { type: String, required: true, trim: true },
    departamento: { type: String, required: true, trim: true },
    sueldo: { type: Number, required: true, min: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const EmployeeModel = model<EmployeeDocument>('Empleado', employeeSchema);
