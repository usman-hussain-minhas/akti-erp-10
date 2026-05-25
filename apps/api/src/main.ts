import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { createRateLimitMiddleware, readRateLimitConfig } from './security/rate-limit.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(createRateLimitMiddleware(readRateLimitConfig()));
  const port = Number.parseInt(process.env.PORT ?? "3001", 10);
  await app.listen(port);
}

void bootstrap();
