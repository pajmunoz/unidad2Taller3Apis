# Informe técnico: resolución de los retos 1 y 2

## Datos informativos

- **Asignatura:** Patrones de Diseño de APIs
- **Unidad:** Unidad 2
- **Proyecto:** API REST para la gestión de empleados
- **Estudiante:** [Ingrese su nombre]
- **Docente:** [Ingrese el nombre del docente]
- **Fecha:** [Ingrese la fecha de entrega]

## 1. Descripción de la actividad

La actividad consistió en refactorizar una API REST de gestión de empleados desarrollada con Node.js, Express, TypeScript, MongoDB y Mongoose.  
Inicialmente, el controlador accedía directamente al modelo de Mongoose, lo que generaba un fuerte acoplamiento entre la capa HTTP y la persistencia.  
Para resolver el primer reto se aplicó el patrón Repository mediante la definición de la interfaz `IEmployeeRepository`.  
Esta interfaz estableció las operaciones de consulta, creación, actualización y eliminación requeridas por el dominio.  
La implementación `MongooseEmployeeRepository` concentró las consultas específicas de Mongoose dentro de la capa de infraestructura.  
El controlador pasó a depender únicamente de la abstracción del repositorio y recibió su implementación mediante inyección de dependencias.  
El archivo `index.ts` se utilizó como punto de composición para crear el repositorio concreto e inyectarlo en la aplicación Express.  
También se separaron la entidad del dominio, el esquema de Mongoose y la administración de la conexión con MongoDB.  
Para resolver el segundo reto se incorporó Zod como mecanismo de validación declarativa de cuerpos y parámetros HTTP.  
Los DTO establecieron reglas para el nombre, cargo, departamento, sueldo e identificador de cada empleado.  
Un middleware perimetral se encargó de validar y sanitizar cada solicitud antes de permitir su llegada al controlador.  
Además, se implementó el patrón Response Wrapper para entregar respuestas exitosas y fallidas con una estructura uniforme.  
El middleware global de errores transformó errores de validación, rutas inexistentes, JSON malformado y fallos inesperados en respuestas seguras.  
Las operaciones fueron verificadas mediante Postman, comprobando tanto el flujo CRUD exitoso como el rechazo de entradas inválidas.  
Finalmente, la documentación Swagger permitió visualizar los contratos, esquemas, parámetros y respuestas disponibles en la API.

## 2. Capturas de código para el Reto 1

Las capturas deben mostrar el explorador de archivos de Visual Studio Code y el contenido indicado con un tamaño de fuente legible.

| N.º | Archivo o vista que se debe capturar | Contenido importante que debe observarse | Nombre sugerido |
|---:|---|---|---|
| 1 | `backend/src/domain/entities/employee.ts` | Entidad `Employee` y tipos `NewEmployee` y `EmployeeChanges`, sin dependencias de Mongoose. | `reto1-01-entidad-dominio.png` |
| 2 | `backend/src/domain/repositories/IEmployeeRepository.ts` | Interfaz con los métodos `findAll`, `create`, `update` y `delete`. | `reto1-02-contrato-repository.png` |
| 3 | `backend/src/infrastructure/repositories/MongooseEmployeeRepository.ts` | Clase que implementa `IEmployeeRepository`, consultas de Mongoose y función `toDomain`. | `reto1-03-adaptador-mongoose.png` |
| 4 | `backend/src/infrastructure/database/mongoose/employee.model.ts` | Esquema de persistencia y creación de `EmployeeModel`, aislados en infraestructura. | `reto1-04-modelo-mongoose.png` |
| 5 | `backend/src/controllers/empleados.controllers.ts` | Constructor que recibe `IEmployeeRepository` y operaciones que utilizan la abstracción. Debe verse que no se importa Mongoose. | `reto1-05-controlador-desacoplado.png` |
| 6 | `backend/src/routes/empleados.routes.ts` | Función `createEmployeeRouter` y creación del controlador mediante el repositorio recibido. | `reto1-06-inyeccion-rutas.png` |
| 7 | `backend/src/index.ts` | Creación de `MongooseEmployeeRepository` e inyección mediante `createApp(employeeRepository)`. | `reto1-07-punto-composicion.png` |
| 8 | Explorador de archivos de `backend/src` | Estructura de carpetas `domain`, `infrastructure`, `controllers`, `routes` y separación de responsabilidades. | `reto1-08-estructura-proyecto.png` |

### Evidencia que debe explicarse en las capturas del Reto 1

El controlador no conoce `EmployeeModel`, `Schema`, `ObjectId` ni los métodos particulares de Mongoose. La dependencia apunta hacia `IEmployeeRepository`, mientras que `MongooseEmployeeRepository` implementa dicho contrato. Por esta razón, la persistencia puede sustituirse por otra implementación sin modificar el controlador ni las rutas.

## 3. Capturas de código para el Reto 2

| N.º | Archivo o vista que se debe capturar | Contenido importante que debe observarse | Nombre sugerido |
|---:|---|---|---|
| 1 | `backend/src/dtos/employee.dto.ts` | Esquemas Zod para creación, actualización e identificador; reglas de longitud, campos estrictos y sueldo positivo. | `reto2-01-dto-zod.png` |
| 2 | `backend/src/middlewares/validate-request.middleware.ts` | Validación de `req.params` y `req.body` antes de llamar a `next()`. | `reto2-02-middleware-validacion.png` |
| 3 | `backend/src/shared/http/api-response.ts` | Interfaces `ApiSuccess`, `ApiFailure` y funciones `sendSuccess` y `sendError`. | `reto2-03-response-wrapper.png` |
| 4 | `backend/src/shared/errors/AppError.ts` | Error operacional que conserva un mensaje controlado y código HTTP. | `reto2-04-app-error.png` |
| 5 | `backend/src/middlewares/error-handler.middleware.ts` | Tratamiento de `ZodError`, `AppError`, JSON malformado, errores inesperados y rutas inexistentes. | `reto2-05-interceptor-errores.png` |
| 6 | `backend/src/routes/empleados.routes.ts` | Uso de `validateRequest` antes de los controladores POST, PUT y DELETE. | `reto2-06-validacion-rutas.png` |
| 7 | `backend/src/controllers/empleados.controllers.ts` | Uso de `sendSuccess` y envío de errores mediante `next`, sin respuestas planas inconsistentes. | `reto2-07-controlador-wrapper.png` |
| 8 | `backend/src/app.ts` | Registro de rutas seguido por `notFoundHandler` y `errorHandler` al final de la cadena de middlewares. | `reto2-08-registro-interceptor.png` |
| 9 | Swagger UI en `http://localhost:3000/api-docs` | Vista general de los endpoints, esquemas y códigos de respuesta documentados. | `reto2-09-swagger-ui.png` |

### Evidencia que debe explicarse en las capturas del Reto 2

La validación ocurre en el perímetro de la aplicación, antes del controlador y antes del acceso al repositorio. Cuando los datos no cumplen el DTO, Zod produce los detalles del error y el interceptor global entrega una respuesta `400` uniforme, sin exponer la excepción interna ni ejecutar operaciones sobre MongoDB.

## 4. Capturas de las peticiones de Postman

En cada captura se recomienda mostrar simultáneamente el método HTTP, la URL, el cuerpo enviado, el código de estado, la respuesta JSON y la pestaña **Test Results**. La colección que debe utilizarse es `backend/postman/empleados.postman_collection.json`.

| N.º | Petición que se debe capturar | Resultado esperado | Nombre sugerido |
|---:|---|---|---|
| 1 | `GET http://localhost:3000/health` | Estado `200`; wrapper con `success: true` y `data.status: "ok"`. | `postman-01-health-200.png` |
| 2 | `GET http://localhost:3000/api/v1/empleados` | Estado `200`; `data` contiene un arreglo de empleados. | `postman-02-listar-200.png` |
| 3 | `POST http://localhost:3000/api/v1/empleados` con datos válidos | Estado `201`; empleado creado dentro de `data` y presencia del campo `id`. | `postman-03-crear-201.png` |
| 4 | `PUT http://localhost:3000/api/v1/empleados/{{employeeId}}` | Estado `200`; cargo y sueldo modificados dentro de `data`. | `postman-04-actualizar-200.png` |
| 5 | `DELETE http://localhost:3000/api/v1/empleados/{{employeeId}}` | Estado `200`; mensaje de eliminación y `data: null`. | `postman-05-eliminar-200.png` |
| 6 | `POST http://localhost:3000/api/v1/empleados` con `nombre: "An"` y `sueldo: -200` | Estado `400`; `success: false` y errores correspondientes a `nombre` y `sueldo`. | `postman-06-validacion-body-400.png` |
| 7 | `DELETE http://localhost:3000/api/v1/empleados/id-invalido` | Estado `400`; error estructurado para el campo `id`. | `postman-07-validacion-id-400.png` |
| 8 | `GET http://localhost:3000/ruta-inexistente` | Estado `404`; wrapper de error sin detalles internos del servidor. | `postman-08-ruta-404.png` |
| 9 | Vista del **Collection Runner** después de ejecutar toda la colección | Todas las pruebas automáticas aprobadas y sin fallos. | `postman-09-runner-aprobado.png` |

## 5. Organización sugerida de las evidencias

Se recomienda crear la siguiente carpeta sin incluir información sensible:

```text
evidencias/
├── reto1-01-entidad-dominio.png
├── reto1-02-contrato-repository.png
├── ...
├── reto2-01-dto-zod.png
├── reto2-02-middleware-validacion.png
├── ...
├── postman-01-health-200.png
└── postman-09-runner-aprobado.png
```

Para insertar posteriormente una captura en este documento se puede utilizar:

```markdown
![Descripción de la evidencia](evidencias/nombre-de-la-captura.png)
```

Antes de tomar cada captura deben ocultarse contraseñas, tokens, cadenas privadas de MongoDB Atlas y el contenido del archivo `.env`.

## 6. Conclusiones

1. La aplicación del patrón Repository y de la inyección de dependencias permitió invertir la relación entre el controlador y la persistencia. El dominio define ahora las operaciones que necesita mediante `IEmployeeRepository`, mientras que Mongoose se encuentra confinado a la infraestructura. Esta separación reduce el acoplamiento, facilita las pruebas y permite reemplazar MongoDB sin reescribir la capa HTTP.

2. La incorporación de DTO con Zod, un response wrapper y un interceptor global fortaleció el contrato de la API. Las solicitudes inválidas son rechazadas antes de acceder a la lógica de negocio o a la base de datos, y todas las respuestas conservan una estructura predecible que evita la exposición de errores internos y simplifica el consumo desde clientes como Postman o una aplicación frontend.
