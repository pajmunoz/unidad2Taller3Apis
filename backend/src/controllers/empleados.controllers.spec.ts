import { Request, Response } from 'express';
import { EmpleadosController } from './empleados.controllers.js';
import { IEmployeeRepository } from '../domain/repositories/IEmployeeRepository.js';
import { Employee } from '../domain/entities/employee.js';
import { AppError } from '../shared/errors/AppError.js';
import { createEmployeeBodySchema, employeeIdParamsSchema } from '../dtos/employee.dto.js';

describe('🧪 Unit Test: EmployeeController (Mantenibilidad & Testabilidad)', () => {
    let controller: EmpleadosController;
    let mockRepository: jest.Mocked<IEmployeeRepository>;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        // 1. Crear un Mock 100% aislado de la interfaz (Cero dependencia de Mongoose)
        mockRepository = {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };
        controller = new EmpleadosController(mockRepository);
        // 2. Mockear los objetos del ciclo de vida de Express
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        mockResponse = { status: statusMock };
    });

    it('✅ Debería retornar un estado 200 y la lista de empleados de la abstracción', async () => {
        const fakeEmployees = [
            { nombre: 'Andrés Mendoza', cargo: 'Arquitecto', departamento: 'TI', sueldo: 4000 }
        ];

        mockRepository.findAll.mockResolvedValue(fakeEmployees as unknown as readonly Employee[]);
        mockRequest = {};
        await controller.getEmployees(mockRequest as Request, mockResponse as Response, jest.fn());

        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({
            success: true,
            message: 'Empleados obtenidos correctamente',
            data: fakeEmployees,
        });
        expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('✅ Debería crear un empleado y retornar un estado 201', async () => {
        const newEmployee = { nombre: 'Laura Torres', cargo: 'Dev', departamento: 'TI', sueldo: 3000 };
        const createdEmployee = { id: '507f1f77bcf86cd799439011', ...newEmployee };

        mockRepository.create.mockResolvedValue(createdEmployee as unknown as Employee);
        mockRequest = { body: newEmployee };
        await controller.addEmployee(mockRequest as unknown as Parameters<typeof controller.addEmployee>[0], mockResponse as Response, jest.fn());

        expect(statusMock).toHaveBeenCalledWith(201);
        expect(jsonMock).toHaveBeenCalledWith({
            success: true,
            message: 'Empleado creado correctamente',
            data: createdEmployee,
        });
        expect(mockRepository.create).toHaveBeenCalledWith(newEmployee);
    });

    it('✅ Debería eliminar un empleado existente y retornar un estado 200', async () => {
        mockRepository.delete.mockResolvedValue(true);
        mockRequest = { params: { id: '507f1f77bcf86cd799439011' } };
        await controller.deleteEmployee(mockRequest as unknown as Parameters<typeof controller.deleteEmployee>[0], mockResponse as Response, jest.fn());

        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({
            success: true,
            message: 'Empleado eliminado correctamente',
            data: null,
        });
        expect(mockRepository.delete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('🔎 [Negativo] El schema Zod debería rechazar un body sin el campo "sueldo"', () => {
        const malformedBody = { nombre: 'Carlos Ruiz', cargo: 'QA', departamento: 'TI' };
        const result = createEmployeeBodySchema.safeParse(malformedBody);

        expect(result.success).toBe(false);
    });

    it('🔎 [Negativo] El schema Zod debería rechazar un "id" con formato inválido (no ObjectId)', () => {
        const result = employeeIdParamsSchema.safeParse({ id: 'abc-no-valido' });

        expect(result.success).toBe(false);
    });

    it('🔎 [Negativo] Debería propagar un error 404 vía next() al actualizar un empleado inexistente', async () => {
        mockRepository.update.mockResolvedValue(null);
        mockRequest = { params: { id: '507f1f77bcf86cd799439011' }, body: { sueldo: 5000 } };
        const nextMock = jest.fn();
        await controller.updateEmployee(mockRequest as unknown as Parameters<typeof controller.updateEmployee>[0], mockResponse as Response, nextMock);

        expect(nextMock).toHaveBeenCalledWith(expect.any(AppError));
        expect(nextMock.mock.calls[0][0]).toMatchObject({ message: 'Empleado no encontrado', statusCode: 404 });
        expect(statusMock).not.toHaveBeenCalled();
    });
});
