# 🚀 Guía de Configuración Rápida - GesGov Backend

## ✅ Estado del Proyecto

El backend está **completamente configurado** y listo para usar. Todos los archivos han sido creados y el proyecto compila correctamente.

## 📦 Archivos Creados

### Estructura Completa:
```
backend/
├── src/
│   ├── common/
│   │   ├── enums/
│   │   │   └── document-status.enum.ts ✅
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts ✅
│   │   └── interceptors/
│   │       └── transform.interceptor.ts ✅
│   ├── modules/
│   │   └── documents/
│   │       ├── dto/
│   │       │   ├── create-document.dto.ts ✅
│   │       │   └── update-document.dto.ts ✅
│   │       ├── schemas/
│   │       │   └── document.schema.ts ✅
│   │       ├── documents.controller.ts ✅
│   │       ├── documents.service.ts ✅
│   │       └── documents.module.ts ✅
│   ├── app.module.ts ✅
│   └── main.ts ✅
├── uploads/
│   └── .gitkeep ✅
├── .env ✅
├── .env.example ✅
├── .gitignore ✅
├── package.json ✅
├── README.md ✅
└── SETUP.md ✅ (este archivo)
```

## 🔧 Próximos Pasos

### 1. Configurar MongoDB Atlas

**IMPORTANTE:** Debes configurar tu base de datos antes de ejecutar el proyecto.

1. Ve a [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Crea una cuenta gratuita (si no tienes)
3. Crea un **Cluster M0 (Free)**
4. En **Database Access**:
   - Click en "Add New Database User"
   - Crea un usuario con contraseña
   - Guarda las credenciales
5. En **Network Access**:
   - Click en "Add IP Address"
   - Selecciona "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirma
6. En **Database** → **Connect**:
   - Selecciona "Drivers"
   - Copia la URI de conexión
   - Se verá así: `mongodb+srv://<usuario>:<password>@cluster0.xxxxx.mongodb.net/`

### 2. Configurar Variables de Entorno

Edita el archivo `.env` en la carpeta `backend/`:

```env
PORT=3001
MONGODB_URI=mongodb+srv://TU_USUARIO:TU_PASSWORD@cluster0.xxxxx.mongodb.net/doctrack?retryWrites=true&w=majority
MAX_FILE_SIZE_MB=10
UPLOAD_PATH=./uploads
FRONTEND_URL=http://localhost:5173
```

**Reemplaza:**
- `TU_USUARIO` con el usuario que creaste en MongoDB Atlas
- `TU_PASSWORD` con la contraseña
- `cluster0.xxxxx.mongodb.net` con tu cluster real

### 3. Ejecutar el Proyecto

```bash
# Asegúrate de estar en la carpeta backend
cd backend

# Ejecutar en modo desarrollo (con hot-reload)
npm run start:dev
```

Verás este mensaje cuando esté listo:
```
🚀 Backend corriendo en http://localhost:3001/api/v1
```

## 🧪 Probar la API

### Opción 1: Con cURL (desde terminal)

```bash
# Listar documentos (debería devolver array vacío al inicio)
curl http://localhost:3001/api/v1/documents

# Ver estadísticas
curl http://localhost:3001/api/v1/documents/stats
```

### Opción 2: Con Postman o Thunder Client

1. **GET** `http://localhost:3001/api/v1/documents` - Listar documentos
2. **GET** `http://localhost:3001/api/v1/documents/stats` - Ver estadísticas
3. **POST** `http://localhost:3001/api/v1/documents` - Crear documento
   - Body: `form-data`
   - Campos:
     - `title`: "Mi primer documento"
     - `description`: "Descripción de prueba"
     - `responseDeadline`: "2025-12-31"
     - `file`: [seleccionar un archivo PDF o imagen]

### Opción 3: Crear un documento de prueba

Crea un archivo `test.pdf` o usa cualquier PDF, luego:

```bash
curl -X POST http://localhost:3001/api/v1/documents \
  -F "title=Documento de Prueba" \
  -F "description=Este es un documento de prueba" \
  -F "responseDeadline=2025-12-31" \
  -F "file=@test.pdf"
```

## 📊 Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/v1/documents` | Crear documento + subir archivo |
| `GET` | `/api/v1/documents` | Listar todos los documentos |
| `GET` | `/api/v1/documents/stats` | Obtener estadísticas por estado |
| `GET` | `/api/v1/documents/:id` | Obtener un documento específico |
| `PATCH` | `/api/v1/documents/:id` | Actualizar documento |
| `DELETE` | `/api/v1/documents/:id` | Eliminar documento |

## 🎯 Estados de Documentos

El sistema calcula automáticamente el estado según la fecha límite:

- **PENDIENTE**: Sin fecha de respuesta asignada
- **EN_PROCESO**: Más de 3 días restantes
- **POR_VENCER**: 3 días o menos restantes
- **VENCIDO**: Fecha superada
- **RESPONDIDO**: Marcado manualmente como respondido

## ⚠️ Solución de Problemas

### Error: "Cannot connect to MongoDB"
- Verifica que tu URI en `.env` sea correcta
- Asegúrate de que tu IP esté en la whitelist de MongoDB Atlas
- Verifica que el usuario y contraseña sean correctos

### Error: "Port 3001 already in use"
- Cambia el puerto en `.env`: `PORT=3002`
- O detén el proceso que usa el puerto 3001

### Error al subir archivos
- Verifica que la carpeta `uploads/` exista
- Verifica los permisos de escritura en la carpeta

## 📝 Notas Importantes

1. **Archivos subidos**: Se guardan en `uploads/` (solo para desarrollo)
2. **Base de datos**: MongoDB Atlas (gratuito hasta 512MB)
3. **CORS**: Configurado para `http://localhost:5173` (frontend React)
4. **Validación**: Automática en todos los DTOs
5. **Tamaño máximo**: 10MB por archivo

## 🎉 ¡Listo!

Tu backend está completamente configurado. Solo necesitas:
1. ✅ Configurar MongoDB Atlas
2. ✅ Actualizar el archivo `.env`
3. ✅ Ejecutar `npm run start:dev`

Para más detalles, consulta el archivo `README.md`.

---

**¿Necesitas ayuda?** Revisa los logs en la consola cuando ejecutes el servidor.
