import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { createRateLimitMiddleware } from './security/rate-limit.middleware';
import { readApiRuntimeEnvironment, configureCors } from './security/runtime-environment';
import { createSecurityHeadersMiddleware } from './security/security-headers.middleware';

async function bootstrap() {
  const runtimeEnvironment = readApiRuntimeEnvironment();
  process.env.AKTI_AUTH_SESSION_SECRET = runtimeEnvironment.authSessionSecret;

  const app = await NestFactory.create(AppModule);
  configureCors(app, runtimeEnvironment.corsAllowedOrigins);
  app.use(createSecurityHeadersMiddleware(runtimeEnvironment.securityHeadersEnabled));
  app.use(createRateLimitMiddleware(runtimeEnvironment.rateLimit));
  await app.listen(runtimeEnvironment.port);
}

void bootstrap();
