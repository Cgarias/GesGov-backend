import { NestFactory }         from '@nestjs/core';
import { ValidationPipe }      from '@nestjs/common';
import { AppModule }           from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global de la API
  app.setGlobalPrefix('api/v1');

  // Validación automática de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:            true,
      forbidNonWhitelisted: true,
      transform:            true,
      transformOptions:     { enableImplicitConversion: true },
    }),
  );

  // Filtro global de errores
  app.useGlobalFilters(new AllExceptionsFilter());

  // CORS — acepta el origen del frontend (variable de entorno)
  const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin:      allowedOrigins,
    methods:     ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Endpoint de salud — usado por Render para health checks y keep-alive
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Backend corriendo en http://0.0.0.0:${port}/api/v1`);
}

bootstrap();
