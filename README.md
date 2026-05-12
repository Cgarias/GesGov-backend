# GesGov Backend

> API REST para el Sistema de Gestión Documental de la Alcaldía Municipal.

[![NestJS](https://img.shields.io/badge/NestJS-11.0-E0234E?logo=nestjs)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1-3178C6?logo=typescript)](https://typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://mongodb.com/atlas)
[![Deploy](https://img.shields.io/badge/Deploy-Render-46E3B7?logo=render)](https://render.com)

---

## Descripción

API REST construida con NestJS que gestiona la autenticación de usuarios y el ciclo de vida completo de documentos institucionales, incluyendo carga de archivos, cálculo automático de estados y estadísticas en tiempo real.

---

## Requisitos

- Node.js 20+
- npm 9+
- Cuenta en MongoDB Atlas

---

## Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Desarrollo con hot-reload
npm run start:dev

# Producción
npm run build
npm run start:prod
```

---

## Variables de Entorno

| Variable | Requerida | Default | Descripción |
|----------|-----------|---------|-------------|
| `PORT` | No | `3001` | Puerto del servidor |
| `MONGODB_URI` | **Sí** | — | URI de conexión a MongoDB Atlas |
| `JWT_SECRET` | **Sí** | — | Clave secreta para firmar tokens JWT |
| `JWT_EXPIRES_IN` | No | `8h` | Duración del token JWT |
| `FRONTEND_URL` | No | `http://localhost:5173` | URL del frontend (CORS) |
| `MAX_FILE_SIZE_MB` | No | `10` | Tamaño máximo de archivos en MB |
| `UPLOAD_PATH` | No | `./uploads` | Ruta de almacenamiento de archivos |

---

## Estructura del Proyecto

```
src/
├── main.ts                              # Bootstrap: puerto, CORS, pipes, filtros
├── app.module.ts                        # Módulo raíz: ConfigModule, MongooseModule
│
├── common/
│   ├── enums/
│   │   └── document-status.enum.ts     # PENDIENTE | EN_PROCESO | POR_VENCER | VENCIDO | RESPONDIDO
│   ├── filters/
│   │   └── http-exception.filter.ts    # Manejo global de errores HTTP
│   ├── guards/
│   │   └── jwt-auth.guard.ts           # Guard reutilizable para rutas protegidas
│   └── interceptors/
│       └── transform.interceptor.ts    # Transformación uniforme de respuestas
│
└── modules/
    ├── auth/
    │   ├── auth.controller.ts          # POST /login, POST /register, GET /me
    │   ├── auth.module.ts              # Configura JWT, Passport, seed admin
    │   ├── auth.service.ts             # Lógica: login, register, perfil, seed
    │   ├── dto/
    │   │   ├── login.dto.ts            # { email, password }
    │   │   └── register.dto.ts         # { name, email, password, role?, position?, phone? }
    │   ├── schemas/
    │   │   └── user.schema.ts          # Modelo User con roles
    │   └── strategies/
    │       └── jwt.strategy.ts         # Valida token y adjunta user a request
    │
    └── documents/
        ├── documents.controller.ts     # CRUD + upload, protegido con JwtAuthGuard
        ├── documents.module.ts         # Importa AuthModule para el guard
        ├── documents.service.ts        # Lógica: CRUD, computeStatus, stats
        ├── dto/
        │   ├── create-document.dto.ts  # { title, description?, responseDeadline?, notes? }
        │   └── update-document.dto.ts  # Todos los campos opcionales + status
        └── schemas/
            └── document.schema.ts      # Modelo Document con timestamps
```

---

## API Reference

### Base URL
- **Desarrollo:** `http://localhost:3001/api/v1`
- **Producción:** `https://gesgov-backend.onrender.com/api/v1`

### Health Check

```http
GET /health
```
No requiere autenticación. Responde `{ "status": "ok", "timestamp": "..." }`.

---

### Autenticación

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@alcaldia.gov.co",
  "password": "Admin1234!"
}
```

**Respuesta 200:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6641a2b3c4d5e6f7a8b9c0d1",
    "name": "Administrador",
    "email": "admin@alcaldia.gov.co",
    "role": "ADMIN",
    "position": "Administrador del Sistema"
  }
}
```

**Errores:**
- `401` — Credenciales incorrectas
- `400` — Validación fallida (email inválido, contraseña vacía)

---

#### Registro
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "jperez@alcaldia.gov.co",
  "password": "MiPassword123!",
  "role": "SECRETARY",
  "position": "Secretario General",
  "phone": "+57 300 000 0000"
}
```

**Campos:**

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|-----------|
| `name` | string | **Sí** | 2-100 caracteres |
| `email` | string | **Sí** | Formato email válido, único |
| `password` | string | **Sí** | Mínimo 8 caracteres |
| `role` | enum | No | `ADMIN` \| `SECRETARY` \| `VIEWER` |
| `position` | string | No | Máx. 80 caracteres |
| `phone` | string | No | Máx. 20 caracteres |

**Respuesta 201:** Mismo formato que login.

**Errores:**
- `409` — El correo ya está registrado
- `400` — Validación fallida

---

#### Perfil del usuario autenticado
```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

**Respuesta 200:**
```json
{
  "_id": "6641a2b3c4d5e6f7a8b9c0d1",
  "name": "Administrador",
  "email": "admin@alcaldia.gov.co",
  "role": "ADMIN",
  "position": "Administrador del Sistema",
  "phone": null
}
```

---

### Documentos

> Todos los endpoints requieren `Authorization: Bearer <token>`

#### Listar todos los documentos
```http
GET /api/v1/documents
Authorization: Bearer <token>
```

**Respuesta 200:** Array de documentos ordenados por fecha de creación (más reciente primero). El estado se recalcula automáticamente en cada consulta.

```json
[
  {
    "_id": "6641b3c4d5e6f7a8b9c0d2e3",
    "title": "Solicitud de Presupuesto Q2",
    "description": "Solicitud de asignación presupuestal para el segundo trimestre",
    "fileName": "solicitud_presupuesto.pdf",
    "filePath": "uploads/1778127684764-750212802.pdf",
    "mimeType": "application/pdf",
    "fileSize": 245760,
    "responseDeadline": "2026-05-20T00:00:00.000Z",
    "status": "EN_PROCESO",
    "respondedAt": null,
    "notes": "Revisar con el director financiero",
    "createdAt": "2026-05-01T14:30:00.000Z",
    "updatedAt": "2026-05-01T14:30:00.000Z"
  }
]
```

---

#### Estadísticas
```http
GET /api/v1/documents/stats
Authorization: Bearer <token>
```

**Respuesta 200:**
```json
{
  "PENDIENTE": 2,
  "EN_PROCESO": 8,
  "POR_VENCER": 3,
  "VENCIDO": 1,
  "RESPONDIDO": 15
}
```

---

#### Obtener un documento
```http
GET /api/v1/documents/:id
Authorization: Bearer <token>
```

**Respuesta 200:** Objeto documento (mismo formato que el listado).

**Errores:**
- `404` — Documento no encontrado

---

#### Crear documento con archivo
```http
POST /api/v1/documents
Authorization: Bearer <token>
Content-Type: multipart/form-data

title: "Nombre del documento"
file: [archivo binario]
description: "Descripción opcional"
responseDeadline: "2026-06-15"
notes: "Notas internas opcionales"
```

**Campos del formulario:**

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|-----------|
| `title` | string | **Sí** | 3-150 caracteres |
| `file` | File | **Sí** | PDF, Word, Excel, JPG, PNG — máx. 10 MB |
| `description` | string | No | Máx. 500 caracteres |
| `responseDeadline` | string | No | Fecha ISO 8601 (YYYY-MM-DD) |
| `notes` | string | No | Máx. 500 caracteres |

**Tipos de archivo permitidos:**
- `application/pdf`
- `image/jpeg`, `image/jpg`, `image/png`
- `application/msword`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- `application/vnd.ms-excel`
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**Respuesta 201:** Objeto documento creado.

**Errores:**
- `400` — Validación fallida, tipo de archivo no permitido, archivo muy grande
- `401` — Token inválido o expirado

---

#### Actualizar documento
```http
PATCH /api/v1/documents/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Nuevo título",
  "status": "RESPONDIDO",
  "notes": "Respondido el 15 de mayo"
}
```

Todos los campos son opcionales. Al enviar `status: "RESPONDIDO"` se registra automáticamente la fecha en `respondedAt`.

**Respuesta 200:** Objeto documento actualizado.

---

#### Eliminar documento
```http
DELETE /api/v1/documents/:id
Authorization: Bearer <token>
```

**Respuesta 204:** Sin contenido.

> **Nota:** Elimina el registro de MongoDB pero **no elimina el archivo físico** del servidor.

---

## Modelos de Datos

### User

```typescript
{
  _id:       ObjectId,
  name:      string,          // Nombre completo (2-100 chars)
  email:     string,          // Único, lowercase
  password:  string,          // Bcrypt hash — nunca se devuelve en queries
  role:      'ADMIN' | 'SECRETARY' | 'VIEWER',
  isActive:  boolean,         // Default: true
  position?: string,          // Cargo institucional
  phone?:    string,
  createdAt: Date,
  updatedAt: Date
}
```

### Document

```typescript
{
  _id:               ObjectId,
  title:             string,
  description?:      string,
  fileName:          string,   // Nombre original del archivo
  filePath:          string,   // Ruta relativa: uploads/timestamp-random.ext
  mimeType:          string,   // MIME type del archivo
  fileSize:          number,   // Tamaño en bytes
  responseDeadline?: Date,     // Fecha límite de respuesta
  status:            'PENDIENTE' | 'EN_PROCESO' | 'POR_VENCER' | 'VENCIDO' | 'RESPONDIDO',
  respondedAt?:      Date,     // Se registra al marcar como RESPONDIDO
  notes?:            string,   // Notas internas
  createdAt:         Date,
  updatedAt:         Date
}
```

---

## Lógica de Cálculo de Estado

El método `computeStatus()` en `DocumentsService` determina el estado:

```typescript
private computeStatus(deadline?: Date, currentStatus?: DocumentStatus): DocumentStatus {
  // RESPONDIDO es permanente — nunca cambia
  if (currentStatus === DocumentStatus.RESPONDIDO) return DocumentStatus.RESPONDIDO;

  // Sin fecha límite → PENDIENTE
  if (!deadline) return DocumentStatus.PENDIENTE;

  const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / 86400000);

  if (daysLeft < 0)  return DocumentStatus.VENCIDO;     // Fecha superada
  if (daysLeft <= 3) return DocumentStatus.POR_VENCER;  // ≤ 3 días
  return DocumentStatus.EN_PROCESO;                      // > 3 días
}
```

Este método se ejecuta:
1. Al **crear** un documento
2. Al **listar** todos los documentos (`findAll`)
3. Al **obtener** un documento individual (`findOne`)

Si el estado calculado difiere del almacenado, se actualiza automáticamente en MongoDB.

---

## Autenticación JWT

### Flujo

```
1. Cliente envía POST /auth/login con { email, password }
2. AuthService busca el usuario en MongoDB (con +password)
3. bcrypt.compare() verifica la contraseña
4. JwtService.sign() genera el token con payload { sub, email, role }
5. Se devuelve { accessToken, user }
6. Cliente incluye el token en cada petición: Authorization: Bearer <token>
7. JwtStrategy.validate() verifica el token y carga el usuario
8. El usuario queda disponible en request.user
```

### Payload del Token

```json
{
  "sub": "6641a2b3c4d5e6f7a8b9c0d1",
  "email": "admin@alcaldia.gov.co",
  "role": "ADMIN",
  "iat": 1746000000,
  "exp": 1746028800
}
```

---

## Almacenamiento de Archivos

Los archivos se guardan en `./uploads/` con el formato:
```
{timestamp_ms}-{número_aleatorio}.{extensión_original}
```

Ejemplo: `1778127684764-750212802.pdf`

La ruta relativa se almacena en el campo `filePath` del documento.

> **Para producción en la nube:** Render no tiene almacenamiento persistente en el plan gratuito. Los archivos se pierden al reiniciar el servicio. Para persistencia real, migrar a AWS S3, Google Cloud Storage o Cloudinary.

---

## Usuario Administrador por Defecto

Al arrancar, si la colección `users` está vacía, `AuthModule.onModuleInit()` ejecuta `seedAdmin()`:

```
Email:     admin@alcaldia.gov.co
Password:  Admin1234!
Rol:       ADMIN
```

> Cambia la contraseña después del primer acceso en producción.

---

## Scripts Disponibles

```bash
npm run start:dev    # Desarrollo con hot-reload (ts-node + watch)
npm run build        # Compilar TypeScript → dist/
npm run start:prod   # Ejecutar build compilado
npm run lint         # ESLint
npm run test         # Jest unit tests
npm run test:cov     # Tests con cobertura
```

---

## Despliegue en Render

### Configuración del servicio

| Campo | Valor |
|-------|-------|
| Runtime | Node |
| Build Command | `npm install --include=dev && npm run build` |
| Start Command | `npm run start:prod` |
| Node Version | 20.x |

### Variables de entorno requeridas en Render

```
NODE_ENV=production
PORT=3001
MONGODB_URI=<tu URI de Atlas>
JWT_SECRET=<clave secreta larga>
JWT_EXPIRES_IN=8h
FRONTEND_URL=<URL de Vercel>
MAX_FILE_SIZE_MB=10
UPLOAD_PATH=./uploads
```

### Health Check

Render verifica el servicio en: `GET /health`

---

## CORS

El backend acepta peticiones del origen configurado en `FRONTEND_URL`. En producción, esta variable debe contener la URL exacta de Vercel:

```
FRONTEND_URL=https://gesgov-frontend.vercel.app
```

Para múltiples orígenes, sepáralos con comas:
```
FRONTEND_URL=https://gesgov.vercel.app,https://gesgov-preview.vercel.app
```
