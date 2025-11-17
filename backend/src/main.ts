import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './docs/swagger';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Enable CORS for frontend on different port
  app.setGlobalPrefix('api/v1');
  setupSwagger(app);
  await app.listen(process.env.PORT || 3000);
  console.log('Backend listening on', process.env.PORT || 3000);
}

bootstrap();
