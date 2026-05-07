# GesGov — Backend

API REST construida con NestJS para el sistema de gestión documental de la Alcaldía Municipal.

## Stack

- **Framework**: NestJS 11 + TypeScript
- **Base de datos**: MongoDB Atlas (Mongoose 8)
- **Autenticación**: JWT + Passport
- **Archivos**: Multer (almacenamiento en disco)
- **Validación**: class-validator + class-transformer

## Requisitos

- Node.js 20+
- npm 9+
- Cuenta en MongoDB Atlas

## Instalación

```bash
npm install
```

## Variables de Entorno

Copia `.env.example` como `.env` y completa los valores:

```bash
cp .env.example .env
```

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `PORT` | No | Puerto del servidor (default: `3001`) |
| `MONGODB_URI` | **Sí** | URI de conexión a MongoDB Atlas |
| `JWT_SECRET` | **Sí** | Clave secreta para firmar tokens JWT |
| `JWT_EXPIRES_IN` | No | Duración del token (default: `8h`) |
| `FRONTEND_URL` | No | URL del frontend para CORS (default: `http://localhost:5173`) |
| `MAX_FILE_SIZE_MB` | No | Tamaño máximo de archivos en MB (default: `10`) |
| `UPLOAD_PATH` | No | Ruta de almacenamiento de archivos (default: `./uploads`) |

## Scripts

```bash
# Desarrollo con hot-reload
npm run start:dev

# Producción
npm run build
npm run start:prod

# Linting
npm run lint

# Tests
npm run test
npm run test:cov
```

## Estructura del Proyecto

```
src/
├── main.ts                          # Bootstrap de la aplicación
├── app.module.ts                    # Módulo raíz
├── common/
│   ├── enums/
│   │   └── document-status.enum.ts  # Estados de documentos
│   ├── filters/
│   │   └── http-exception.filter.ts # Manejo global de errores
│   ├── guards/
│   │   └── jwt-auth.guard.ts        # Guard de autenticación JWT
│   └── interceptors/
│       └── transform.interceptor.ts # Transformación de respuestas
└── modules/
    ├── auth/                        # Módulo de autenticación
    │   ├── auth.controller.ts
    │   ├── auth.module.ts
    │   ├── auth.service.ts
    │   ├── dto/
    │   │   ├── login.dto.ts
    │   │   └── register.dto.ts
    │   ├── schemas/
    │   │   └── user.schema.ts
    │   └── strategies/
    │       └── jwt.strategy.ts
    └── documents/                   # Módulo de documentos
        ├── documents.controller.ts
        ├── documents.module.ts
        ├── documents.service.ts
        ├── dto/
        │   ├── create-document.dto.ts
        │   └── update-document.dto.ts
        └── schemas/
            └── document.schema.ts
```

## API Reference

### Autenticación

#### `POST /api/v1/auth/login`
Inicia sesión y devuelve un token JWT.

**Body:**
```json
{
  "email": "admin@alcaldia.gov.co",
  "password": "Admin1234!"
}
```

**Respuesta:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "Administrador",
    "email": "admin@alcaldia.gov.co",
    "role": "ADMIN",
    "position": "Administrador del Sistema"
  }
}
```

#### `POST /api/v1/auth/register`
Crea un nuevo usuario.

**Body:**
```json
{
  "name": "Juan Pérez",
  "email": "jperez@alcaldia.gov.co",
  "password": "MiPassword123!",
  "role": "SECRETARY",
  "position": "Secretario General"
}
```

#### `GET /api/v1/auth/me` 🔒
Devuelve el perfil del usuario autenticado.

**Headers:** `Authorization: Bearer <token>`

---

### Documentos

> Todos los endpoints requieren `Authorization: Bearer <token>`

#### `GET /api/v1/documents`
Lista todos los documentos. Recalcula el estado automáticamente.

**Respuesta:** Array de documentos.

#### `GET /api/v1/documents/stats`
Devuelve conteos agrupados por estado.

**Respuesta:**
```json
{
  "PENDIENTE": 2,
  "EN_PROCESO": 5,
  "POR_VENCER": 1,
  "VENCIDO": 3,
  "RESPONDIDO": 10
}
```

#### `GET /api/v1/documents/:id`
Obtiene un documento por ID.

#### `POST /api/v1/documents`
Crea un nuevo documento con archivo adjunto.

**Content-Type:** `multipart/form-data`

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `title` | string | **Sí** | Título (3-150 caracteres) |
| `file` | File | **Sí** | Archivo (PDF, Word, Excel, JPG, PNG — máx 10MB) |
| `description` | string | No | Descripción (máx 500 caracteres) |
| `responseDeadline` | string (ISO 8601) | No | Fecha límite de respuesta |
| `notes` | string | No | Notas internas (máx 500 caracteres) |

#### `PATCH /api/v1/documents/:id`
Actualiza un documento.

**Body (JSON):** Cualquier campo de `CreateDocumentDto` + `status`.

#### `DELETE /api/v1/documents/:id`
Elimina un documento (no elimina el archivo físico).

---

## Modelos de Datos

### User

```typescript
{
  _id: ObjectId,
  name: string,           // Nombre completo
  email: string,          // Único, lowercase
  password: string,       // Bcrypt hash (no se devuelve en queries)
  role: 'ADMIN' | 'SECRETARY' | 'VIEWER',
  isActive: boolean,
  position?: string,      // Cargo
  phone?: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Document

```typescript
{
  _id: ObjectId,
  title: string,
  description?: string,
  fileName: string,       // Nombre original del archivo
  filePath: string,       // Ruta en disco: uploads/timestamp-random.ext
  mimeType: string,
  fileSize: number,       // Bytes
  responseDeadline?: Date,
  status: 'PENDIENTE' | 'EN_PROCESO' | 'POR_VENCER' | 'VENCIDO' | 'RESPONDIDO',
  respondedAt?: Date,
  notes?: string,
  createdAt: Date,
  updatedAt: Date
}
```

## Lógica de Estados

El estado se calcula automáticamente al crear o consultar documentos:

```
Sin fecha límite          → PENDIENTE
Fecha límite > 3 días     → EN_PROCESO
Fecha límite ≤ 3 días     → POR_VENCER
Fecha límite superada     → VENCIDO
Marcado manualmente       → RESPONDIDO (no cambia)
```

## Almacenamiento de Archivos

Los archivos se guardan en `./uploads/` con el formato:
```
{timestamp}-{número_aleatorio}.{extensión}
```

Ejemplo: `1778127684764-750212802.pdf`

> **Nota para producción:** Para despliegues en la nube, considera migrar a un servicio de almacenamiento de objetos como AWS S3, Google Cloud Storage o Cloudinary, ya que el almacenamiento en disco no persiste entre reinicios de contenedores sin un volumen montado.

## Usuario Administrador por Defecto

Al arrancar, si la colección `users` está vacía, se crea automáticamente:

- **Email:** `admin@alcaldia.gov.co`
- **Contraseña:** `Admin1234!`
- **Rol:** `ADMIN`

> Cambia la contraseña después del primer acceso.

## Despliegue con Docker

```bash
# Construir imagen
docker build -t gesgov-backend .

# Ejecutar contenedor
docker run -d \
  -p 3001:3001 \
  -e MONGODB_URI="mongodb+srv://..." \
  -e JWT_SECRET="tu_secret_seguro" \
  -e FRONTEND_URL="https://tu-frontend.com" \
  -v uploads_data:/app/uploads \
  --name gesgov-backend \
  gesgov-backend
```

O usar Docker Compose desde la raíz del proyecto:

```bash
docker compose up -d --build backend
```

## Despliegue en Railway / Render

1. Conecta el repositorio
2. Configura las variables de entorno en el panel de la plataforma
3. El comando de inicio es: `npm run start:prod`
4. El comando de build es: `npm run build`

> **Importante:** Configura un volumen persistente para `/app/uploads` si usas almacenamiento en disco.
