# Unidad 2: Arquitectura y Patrones de Diseño de APIs

Este repositorio contiene la infraestructura de software base (CRUD de Gestión de Personal) diseñada para la aplicación práctica de patrones empresariales en la **Maestría de Software**. 

El objetivo fundamental de este laboratorio es que el maestrante identifique, evalúe y erradique la **deuda técnica intencional** insertada en el código base, transformando un sistema acoplado y mutable en una arquitectura desacoplada, reactiva, blindada y eficiente bajo los atributos de calidad del estándar **ISO/IEC 25010**.

---

## 🏛️ El Desafío Académico: 4 Retos de Refactorización

Los estudiantes deberán tomar el código fuente inicial (el cual viola principios de diseño como responsabilidad única y encapsulamiento) y resolver incrementalmente los siguientes hitos de ingeniería:

### 📥 [Reto 1] Desacoplamiento del Backend y Persistencia Inversa
*   **Problema en la Base:** Los controladores de Express conocen e instancian directamente el modelo de Mongoose (`EmployeeModel`), acoplando la red con el motor de base de datos.
*   **Refactorización Exigida:** Implementar el **Patrón Repository** mediante una interfaz abstracta (`IEmployeeRepository`). La capa de Express debe ser agnóstica al ODM; si se remueve el `import mongoose` del controlador, el sistema debe seguir compilando perfectamente.

#### Solución implementada

El backend aplica inversión de dependencias mediante estas responsabilidades:

```text
HTTP/Express
    ↓ depende de
IEmployeeRepository (dominio)
    ↑ implementado por
MongooseEmployeeRepository (infraestructura)
    ↓ utiliza
EmployeeModel / MongoDB
```

* `domain/entities/employee.ts`: entidad y tipos del dominio.
* `domain/repositories/IEmployeeRepository.ts`: contrato independiente de la base de datos.
* `infrastructure/repositories/MongooseEmployeeRepository.ts`: adaptador que implementa el contrato.
* `infrastructure/database/mongoose/`: conexión y modelo exclusivos de Mongoose.
* `controllers/empleados.controllers.ts`: depende solamente de `IEmployeeRepository`.
* `index.ts`: punto de composición que construye e inyecta la implementación concreta.

De esta forma, el controlador puede utilizar otra persistencia que implemente el mismo contrato
sin ser modificado y no contiene imports de Mongoose ni del modelo de MongoDB.

### 🛡️ [Reto 2] Validación Perimetral DTO y Respuesta Universal
*   **Problema en la Base:** No existe validación de tipos ni reglas de negocio en tiempo de ejecución. El servidor responde con payloads planos asimétricos y expone excepciones crudas del sistema en caso de fallos.
*   **Refactorización Exigida:** Construir esquemas declarativos con **Zod** (`employee.dto.ts`) para blindar `req.body` y `req.params`. Implementar el **Response Wrapper Pattern** y un middleware interceptor global de errores para unificar las salidas HTTP exitosas y fallidas.

### 📨 [Reto 3] Programación Reactiva e Inmutabilidad en el Servicio
*   **Problema en la Base:** El frontend de Angular almacena el estado en arreglos mutables locales dentro del componente de la vista y realiza peticiones directas mediante `HttpClient` en las funciones de interacción.
*   **Refactorización Exigida:** Aislar la lógica de consumo en un servicio reactivo (`EmployeeService`). Utilizar **RxJS** implementando `BehaviorSubject` privados y flujos exponenciales de solo lectura (`Observable$`) bajo el patrón de mutación de referencias inmutables (`[...current, new]`).

### 🎨 [Reto 4] Arquitectura de Componentes Smart vs. Dumb
*   **Problema en la Base:** El archivo HTML de la vista es un bloque monolítico masivo que mezcla el diseño de los formularios de captura con la rejilla de visualización de datos.
*   **Refactorización Exigida:** Fragmentar la UI. Crear un **Smart Component (Orquestador)** encargado de consumir los observables mediante el **`async` pipe** y delegar la renderización a **Dumb Components (Presentacionales)** independientes conectados exclusivamente por decoradores `@Input()` y `@Output()`.

---

## 🛠️ Requisitos e Instalación del Entorno (Node.js v24+)

Debido a cambios internos en las APIs globales de las versiones de Node.js modernas, este laboratorio descarta el uso del paquete obsoleto `ts-node-dev` y adopta **`tsx`** (impulsado por esbuild) para garantizar una ejecución veloz en caliente y compatibilidad total con módulos nativos de ECMAScript.

### 1. Despliegue del Servidor (Backend)
1. Navega al directorio del backend:
   ```bash
   cd backend
   ```
2. Instala las dependencias de producción y desarrollo:
   ```bash
   npm install
   ```
3. Crea tu configuración local (el repositorio ya incluye un `.env` ignorado por Git):
   ```bash
   cp .env.example .env
   ```
   Para MongoDB local conserva `MONGO_URI=mongodb://127.0.0.1:27017/usuarios_db`.
   Para MongoDB Atlas, reemplázala con la cadena de conexión entregada por Atlas.
4. Asegúrate de que MongoDB esté ejecutándose. Si utilizas Docker Desktop, ábrelo y ejecuta:
   ```bash
   docker compose up -d
   ```
   La primera ejecución descargará MongoDB y creará un volumen persistente. Puedes comprobarlo con:
   ```bash
   docker compose ps
   ```
5. Levanta el servidor:
   ```bash
   npm run dev
   ```
   *El backend inicializará el compilador dinámico y escuchará peticiones en el puerto `3000`.*

La API queda disponible tanto en `http://localhost:3000/api/v1/empleados` como en
`http://localhost:3000/api/v1/employees`. Las operaciones de actualización y eliminación
requieren el identificador en la URL: `PUT /api/v1/empleados/:id` y
`DELETE /api/v1/empleados/:id`.

### Pruebas con Postman

Importa `backend/postman/empleados.postman_collection.json` en Postman y ejecuta la
colección en el orden definido. La colección utiliza `http://localhost:3000` como `baseUrl`;
la creación guarda automáticamente `employeeId` para las pruebas de actualización y eliminación.

### 2. Despliegue de la Interfaz (Frontend)
1. En una nueva terminal, navega al directorio del cliente:
   ```bash
   cd frontend
   ```
2. Instala los paquetes locales y los bundles de estilos visuales (**Bootswatch**):
   ```bash
   npm install
   ```
3. Levanta el servidor local de desarrollo de Angular:
   ```bash
   ng serve -o
   ```
   *La aplicación web se desplegará de forma automática en tu navegador en `http://localhost:4200`.*

---

## 🧪 Validación de Contratos (Pruebas de Caja Negra)

Puedes verificar el comportamiento perimetral de tu servidor y la correcta intercepción de errores de Zod utilizando la extensión **REST Client** de VS Code. Ejecuta las siguientes peticiones sobre un archivo local de pruebas `api.rest`:

### Petición de Creación Exitosa (`POST`)
```http
POST http://localhost:3000/api/v1/employees
Content-Type: application/json

{
  "nombre": "Andrés Mendoza",
  "cargo": "Arquitecto de Software",
  "departamento": "Innovación",
  "sueldo": 4500
}
```

### Petición de Inyección Inválida (Activación del DTO)
```http
POST http://localhost:3000/api/v1/employees
Content-Type: application/json

{
  "nombre": "An",
  "cargo": "Developer",
  "departamento": "TI",
  "sueldo": -200
}
```
*Resultado Esperado: El servidor debe rechazar la petición con un estado `400 Bad Request` antes de tocar el controlador, devolviendo el JSON estructurado con la lista de campos inválidos.*

---

## 📊 Rúbrica de Evaluación Académica

La entrega final del laboratorio se evaluará bajo los siguientes criterios de calidad de código y diseño de sistemas:

*   **Acoplamiento Cero (25%):** El controlador no importa librerías ni dependencias de Mongoose. La conexión a base de datos está totalmente aislada.
*   **Gobernanza del Contrato (25%):** Uso correcto de validadores Zod. Presencia del Response Wrapper unificado tanto en éxitos como en excepciones del sistema.
*   **Flujo Reactivo Asíncrono (25%):** Inexistencia de suscripciones manuales (`.subscribe()`) en los componentes de Angular; uso obligatorio de patrones reactivos y `async` pipe.
*   **Separación de Vistas (25%):** Los componentes presentacionales son puros e inmutables. El formulario clona sus entradas para evitar mutaciones colaterales en la rejilla.
