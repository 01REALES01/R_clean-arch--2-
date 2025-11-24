import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './infrastructure/common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Task Service API')
    .setDescription('Task Service - Handles Authentication and Task Management')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('http://localhost:3000', 'Task Service')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000, '0.0.0.0');
  console.log('🚀 Task Service running on: http://localhost:3000');
  console.log('📚 Swagger UI: http://localhost:3000/api');
}
bootstrap();
