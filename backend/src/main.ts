import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './docs/swagger';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Enable CORS for frontend on different port
  app.setGlobalPrefix('api/v1');
  
  // Setup Swagger - temporarily disabled due to TypeORM enum scanning issues
  try {
    // setupSwagger(app);
    console.log('⚠ Swagger temporarily disabled - TypeORM enum compatibility issue');
    console.log('📖 API endpoints are working at http://localhost:3000/api/v1');
  } catch (error) {
    console.error('Swagger setup failed, continuing without documentation:', error);
  }
  
  await app.listen(process.env.PORT || 3000);
  console.log('Backend listening on', process.env.PORT || 3000);
}

bootstrap();
