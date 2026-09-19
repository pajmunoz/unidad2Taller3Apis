import { z } from 'zod';

const employeeFields = {
  nombre: z
    .string({ message: 'El nombre debe ser texto' })
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede superar 100 caracteres'),
  cargo: z
    .string({ message: 'El cargo debe ser texto' })
    .trim()
    .min(2, 'El cargo debe tener al menos 2 caracteres')
    .max(100, 'El cargo no puede superar 100 caracteres'),
  departamento: z
    .string({ message: 'El departamento debe ser texto' })
    .trim()
    .min(2, 'El departamento debe tener al menos 2 caracteres')
    .max(100, 'El departamento no puede superar 100 caracteres'),
  sueldo: z
    .number({ message: 'El sueldo debe ser numérico' })
    .positive('El sueldo debe ser mayor que cero')
    .finite('El sueldo debe ser un número finito'),
};

export const createEmployeeBodySchema = z.strictObject(employeeFields);

export const updateEmployeeBodySchema = createEmployeeBodySchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe proporcionar al menos un campo para actualizar',
  });

export const employeeIdParamsSchema = z.strictObject({
  id: z
    .string()
    .trim()
    .regex(/^[a-f\d]{24}$/i, 'El identificador del empleado no es válido'),
});

export type CreateEmployeeDto = z.infer<typeof createEmployeeBodySchema>;
export type UpdateEmployeeDto = z.infer<typeof updateEmployeeBodySchema>;
export type EmployeeIdParamsDto = z.infer<typeof employeeIdParamsSchema>;
