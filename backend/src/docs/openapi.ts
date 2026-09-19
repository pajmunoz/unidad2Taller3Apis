const employeeIdParameter = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'Identificador hexadecimal de 24 caracteres del empleado',
  schema: {
    type: 'string',
    pattern: '^[a-fA-F0-9]{24}$',
    example: '507f1f77bcf86cd799439011',
  },
} as const;

const errorResponses = {
  400: {
    description: 'La solicitud contiene datos inválidos',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' },
      },
    },
  },
  500: {
    description: 'Error interno controlado',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' },
      },
    },
  },
} as const;

export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Gestión de empleados API',
    version: '1.0.0',
    description:
      'API REST con Repository Pattern, validación perimetral mediante Zod y respuestas HTTP unificadas.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor local',
    },
  ],
  tags: [
    { name: 'Sistema', description: 'Estado del backend' },
    { name: 'Empleados', description: 'Operaciones CRUD de empleados' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Sistema'],
        summary: 'Comprobar el estado del servidor',
        operationId: 'getHealth',
        responses: {
          200: {
            description: 'Servidor disponible',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/empleados': {
      get: {
        tags: ['Empleados'],
        summary: 'Listar empleados',
        operationId: 'getEmployees',
        responses: {
          200: {
            description: 'Listado obtenido correctamente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/EmployeeListResponse' },
              },
            },
          },
          500: errorResponses[500],
        },
      },
      post: {
        tags: ['Empleados'],
        summary: 'Crear un empleado',
        operationId: 'createEmployee',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateEmployeeRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Empleado creado correctamente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/EmployeeResponse' },
              },
            },
          },
          400: errorResponses[400],
          500: errorResponses[500],
        },
      },
    },
    '/api/v1/empleados/{id}': {
      put: {
        tags: ['Empleados'],
        summary: 'Actualizar un empleado',
        operationId: 'updateEmployee',
        parameters: [employeeIdParameter],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateEmployeeRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Empleado actualizado correctamente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/EmployeeResponse' },
              },
            },
          },
          400: errorResponses[400],
          404: {
            description: 'Empleado no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: errorResponses[500],
        },
      },
      delete: {
        tags: ['Empleados'],
        summary: 'Eliminar un empleado',
        operationId: 'deleteEmployee',
        parameters: [employeeIdParameter],
        responses: {
          200: {
            description: 'Empleado eliminado correctamente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DeleteEmployeeResponse' },
              },
            },
          },
          400: errorResponses[400],
          404: {
            description: 'Empleado no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: errorResponses[500],
        },
      },
    },
  },
  components: {
    schemas: {
      Employee: {
        type: 'object',
        required: [
          'id',
          'nombre',
          'cargo',
          'departamento',
          'sueldo',
          'createdAt',
          'updatedAt',
        ],
        properties: {
          id: {
            type: 'string',
            pattern: '^[a-fA-F0-9]{24}$',
            example: '507f1f77bcf86cd799439011',
          },
          nombre: { type: 'string', example: 'Andrés Mendoza' },
          cargo: { type: 'string', example: 'Arquitecto de Software' },
          departamento: { type: 'string', example: 'Innovación' },
          sueldo: { type: 'number', format: 'double', example: 4500 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateEmployeeRequest: {
        type: 'object',
        additionalProperties: false,
        required: ['nombre', 'cargo', 'departamento', 'sueldo'],
        properties: {
          nombre: { type: 'string', minLength: 3, maxLength: 100, example: 'Andrés Mendoza' },
          cargo: {
            type: 'string',
            minLength: 2,
            maxLength: 100,
            example: 'Arquitecto de Software',
          },
          departamento: {
            type: 'string',
            minLength: 2,
            maxLength: 100,
            example: 'Innovación',
          },
          sueldo: { type: 'number', format: 'double', exclusiveMinimum: 0, example: 4500 },
        },
      },
      UpdateEmployeeRequest: {
        type: 'object',
        additionalProperties: false,
        minProperties: 1,
        properties: {
          nombre: { type: 'string', minLength: 3, maxLength: 100 },
          cargo: { type: 'string', minLength: 2, maxLength: 100, example: 'Tech Lead' },
          departamento: { type: 'string', minLength: 2, maxLength: 100 },
          sueldo: { type: 'number', format: 'double', exclusiveMinimum: 0, example: 5000 },
        },
      },
      FieldError: {
        type: 'object',
        required: ['field', 'message'],
        properties: {
          field: { type: 'string', example: 'nombre' },
          message: {
            type: 'string',
            example: 'El nombre debe tener al menos 3 caracteres',
          },
        },
      },
      EmployeeResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', enum: [true] },
          message: { type: 'string' },
          data: { $ref: '#/components/schemas/Employee' },
        },
      },
      EmployeeListResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', enum: [true] },
          message: { type: 'string' },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Employee' },
          },
        },
      },
      DeleteEmployeeResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', enum: [true] },
          message: { type: 'string', example: 'Empleado eliminado correctamente' },
          data: { nullable: true, example: null },
        },
      },
      HealthResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', enum: [true] },
          message: { type: 'string', example: 'Servidor disponible' },
          data: {
            type: 'object',
            required: ['status'],
            properties: {
              status: { type: 'string', enum: ['ok'] },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        required: ['success', 'message', 'data', 'errors'],
        properties: {
          success: { type: 'boolean', enum: [false] },
          message: { type: 'string', example: 'La solicitud contiene datos inválidos' },
          data: { nullable: true, example: null },
          errors: {
            type: 'array',
            items: { $ref: '#/components/schemas/FieldError' },
          },
        },
      },
    },
  },
} as const;
