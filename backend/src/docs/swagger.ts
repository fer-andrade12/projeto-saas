import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  try {
    const config = new DocumentBuilder()
      .setTitle('SaaS Campaign API')
      .setDescription('API for campaigns, coupons, gifts and integrations')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    // With global prefix 'api/v1' set in main.ts, this will be served at '/api/v1/docs'
    SwaggerModule.setup('docs', app, document);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.warn('Failed to setup Swagger:', errorMessage);
  }
}
