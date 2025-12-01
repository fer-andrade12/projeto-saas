import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('SaaS Campaign API')
    .setDescription('API for campaigns, coupons, cashback and customer management')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Enter JWT token',
      in: 'header',
    })
    .addTag('Authentication', 'Login, signup, and token management')
    .addTag('Campaigns', 'Campaign management endpoints')
    .addTag('Customers', 'Customer and list management')
    .addTag('Coupons', 'Coupon generation and redemption')
    .addTag('Metrics', 'Analytics and dashboard metrics')
    .addTag('Super Admin', 'Super admin operations')
    .addTag('Plans', 'Subscription plans management')
    .build();

  // Create a minimal document to avoid TypeORM enum scanning issues
  const document = SwaggerModule.createDocument(app, config);
  
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
      tryItOutEnabled: true,
    },
    customSiteTitle: 'SaaS Campaign API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
  });
  
  console.log('✓ Swagger documentation available at /api');
}
