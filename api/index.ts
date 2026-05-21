import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import serverlessExpress from '@vendia/serverless-express';
import express from 'express';
import { AppModule } from '../src/app.module';

let cachedHandler: any;

async function bootstrap() {
  if (cachedHandler) return cachedHandler;

  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  app.enableCors();
  await app.init();

  cachedHandler = serverlessExpress({ app: expressApp });
  return cachedHandler;
}

export default async function handler(req: any, res: any) {
  const serverHandler = await bootstrap();
  return serverHandler(req, res);
}
