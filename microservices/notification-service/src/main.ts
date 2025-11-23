import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  
  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Notification Service API')
    .setDescription('Notification Service - Handles Notifications via Event-Driven Architecture')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('http://localhost:3001', 'Notification Service')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(3001);
  console.log('🔔 Notification Service running on: http://localhost:3001');
  console.log('📚 Swagger UI: http://localhost:3001/api');
}
bootstrap();
