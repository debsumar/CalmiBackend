import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Required for rate limiting to be per-client. This app runs behind API
  // Gateway (via serverless-express), so without this every request shares
  // the proxy's IP and ThrottlerGuard would limit all users as one.
  // Value is 1 (trust the nearest hop) rather than `true`, so a caller
  // cannot spoof X-Forwarded-For to dodge the limit.
  app.set('trust proxy', 1);

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Calmi API')
    .setDescription('Calmi Backend API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = Number(process.env.PORT ?? 3500);
  await app.listen(port);

  const url = await app.getUrl();
  logger.log(`🚀 Calmi API is up — listening on ${url}`);
  logger.log(`📚 Swagger UI:    ${url}/api`);
  logger.log(`📄 OpenAPI spec:  ${url}/api-json`);
}
bootstrap();
