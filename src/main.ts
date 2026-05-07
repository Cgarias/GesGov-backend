import { NestFactory }             from '@nestjs/core';
import { ValidationPipe }          from '@nestjs/common';
import { AppModule }               from './app.module';
import { AllExceptionsFilter }     from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global de la API
  app.setGlobalPrefix('api/v1');

  // Validación automática de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:               true,   // Elimina propiedades no declaradas en DTO
      forbidNonWhitelisted:    true,
      transform:               true,   // Convierte strings a tipos correctos
      transformOptions:        { enableImplicitConversion: true },
    }),
  );

  // Filtro global de errores
  app.useGlobalFilters(new AllExceptionsFilter());

  // CORS para el frontend
  app.enableCors({
    origin:  process.env.FRONTEND_URL ?? 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 Backend corriendo en http://localhost:${port}/api/v1`);
}

bootstrap();
