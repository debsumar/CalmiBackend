import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import express, { Express } from 'express';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { AppModule } from '../src/app.module';

/**
 * Vercel's @vercel/node runtime invokes the default export with Node's native
 * http.IncomingMessage / http.ServerResponse — the exact pair Express speaks.
 * So we DON'T need @vendia/serverless-express here (that adapter is for AWS
 * Lambda's event-shaped payloads). We just hand req/res straight to Express.
 *
 * The Nest app is bootstrapped once per Lambda container and the resulting
 * Express instance is cached so subsequent invocations skip the cold-start cost.
 */

let cachedApp: Express | null = null;
let bootstrapPromise: Promise<Express> | null = null;

async function bootstrap(): Promise<Express> {
  if (cachedApp) return cachedApp;
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    const expressApp = express();
    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      { logger: ['error', 'warn', 'log'] },
    );
    nestApp.enableCors();

    // Swagger / OpenAPI docs at /api
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Calmi API')
      .setDescription('Calmi Backend API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(nestApp, swaggerConfig);
    SwaggerModule.setup('api', nestApp, document);

    await nestApp.init();
    cachedApp = expressApp;
    return expressApp;
  })();

  return bootstrapPromise;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  const app = await bootstrap();
  return app(req as any, res as any);
}
