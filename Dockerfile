# ─── Etapa 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar manifiestos e instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente y compilar
COPY . .
RUN npm run build

# ─── Etapa 2: Producción ──────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Solo dependencias de producción
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar build compilado
COPY --from=builder /app/dist ./dist

# Crear carpeta de uploads
RUN mkdir -p uploads

# Usuario no-root por seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser  -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3001

CMD ["node", "dist/main"]
