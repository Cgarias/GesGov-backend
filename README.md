# GesGov Backend - Sistema de Gestión de Documentos

Backend desarrollado con NestJS para gestionar tiempos de respuesta de documentos.

## 🚀 Características

- ✅ CRUD completo de documentos
- ✅ Subida de archivos (PDF, Word, imágenes)
- ✅ Cálculo automático de estados según fechas
- ✅ Estadísticas por estado
- ✅ Validación de DTOs
- ✅ Manejo global de errores
- ✅ MongoDB Atlas como base de datos

## 📋 Requisitos Previos

- Node.js >= 18.x
- npm >= 9.x
- Cuenta en MongoDB Atlas (gratuita)

## 🔧 Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**

Edita el archivo `.env` y reemplaza con tu URI de MongoDB Atlas:

```env
PORT=3001
MONGODB_URI=mongodb+srv://<usuario>:<password>@cluster0.xxxxx.mongodb.net/doctrack?retryWrites=true&w=majority
FRONTEND_URL=http://localhost:5173
```

### Cómo obtener tu MongoDB URI:

1. Ve a [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Crea una cuenta gratuita (si no tienes)
3. Crea un Cluster M0 (Free)
4. En **Database Access** → Agrega un usuario con contraseña
5. En **Network Access** → Agrega `0.0.0.0/0` (o tu IP)
6. En **Connect** → Elige "Drivers" → Copia la URI
7. Reemplaza `<usuario>` y `<password>` con tus credenciales

## ▶️ Ejecutar el Proyecto

### Modo desarrollo (con hot-reload):
```bash
npm run start:dev
```

### Modo producción:
```bash
npm run build
npm run start:prod
```

El servidor estará disponible en: **http://localhost:3001/api/v1**

## 📡 Endpoints de la API

### Documentos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/v1/documents` | Crear documento + subir archivo |
| `GET` | `/api/v1/documents` | Listar todos los documentos |
| `GET` | `/api/v1/documents/stats` | Obtener estadísticas |
| `GET` | `/api/v1/documents/:id` | Obtener un documento |
| `PATCH` | `/api/v1/documents/:id` | Actualizar documento |
| `DELETE` | `/api/v1/documents/:id` | Eliminar documento |

### Ejemplo de uso con cURL:

**Crear documento:**
```bash
curl -X POST http://localhost:3001/api/v1/documents \
  -F "title=Contrato Marco 2025" \
  -F "description=Contrato con proveedor A" \
  -F "responseDeadline=2025-06-15" \
  -F "file=@/ruta/al/archivo.pdf"
```

**Listar documentos:**
```bash
curl http://localhost:3001/api/v1/documents
```

**Ver estadísticas:**
```bash
curl http://localhost:3001/api/v1/documents/stats
```

**Marcar como respondido:**
```bash
curl -X PATCH http://localhost:3001/api/v1/documents/<ID> \
  -H "Content-Type: application/json" \
  -d '{"status": "RESPONDIDO"}'
```

## 📂 Estructura del Proyecto

```
backend/
├── src/
│   ├── common/
│   │   ├── enums/
│   │   │   └── document-status.enum.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   └── interceptors/
│   │       └── transform.interceptor.ts
│   ├── modules/
│   │   └── documents/
│   │       ├── dto/
│   │       │   ├── create-document.dto.ts
│   │       │   └── update-document.dto.ts
│   │       ├── schemas/
│   │       │   └── document.schema.ts
│   │       ├── documents.controller.ts
│   │       ├── documents.service.ts
│   │       └── documents.module.ts
│   ├── app.module.ts
│   └── main.ts
├── uploads/              # Archivos subidos
├── .env                  # Variables de entorno (NO subir a Git)
├── .env.example          # Ejemplo de variables
└── package.json
```

## 🎯 Estados de Documentos

| Estado | Descripción |
|--------|-------------|
| `PENDIENTE` | Sin fecha de respuesta asignada |
| `EN_PROCESO` | Fecha asignada, más de 3 días restantes |
| `POR_VENCER` | Vence en 3 días o menos |
| `VENCIDO` | Fecha de respuesta superada |
| `RESPONDIDO` | Marcado manualmente como respondido |

Los estados se calculan automáticamente según la fecha límite.

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Cobertura
npm run test:cov
```

## 🛠️ Scripts Disponibles

```bash
npm run start:dev      # Desarrollo con hot-reload
npm run start:prod     # Producción
npm run build          # Compilar TypeScript
npm run lint           # Linter
npm run format         # Formatear código
```

## 🔒 Seguridad

- ✅ Validación de DTOs con `class-validator`
- ✅ Whitelist en ValidationPipe (elimina propiedades no declaradas)
- ✅ Validación de tipo y tamaño de archivos
- ✅ Variables de entorno para secretos
- ✅ CORS configurado

## 📝 Notas Importantes

1. **Archivos subidos:** Se almacenan en la carpeta `uploads/` (solo para desarrollo). En producción, considera usar S3 o Cloudinary.

2. **MongoDB Atlas:** Asegúrate de tener tu IP en la whitelist de Network Access.

3. **CORS:** Por defecto permite `http://localhost:5173`. Ajusta `FRONTEND_URL` en `.env` si usas otro puerto.

## 🚀 Próximos Pasos

- [ ] Implementar autenticación con JWT
- [ ] Subir archivos a S3/Cloudinary
- [ ] Notificaciones por email
- [ ] Documentación con Swagger
- [ ] Tests unitarios y e2e
- [ ] Docker para despliegue

## 📄 Licencia

UNLICENSED - Proyecto privado

---

**Desarrollado con NestJS** 🐈
