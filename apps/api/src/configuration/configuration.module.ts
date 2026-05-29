import { Module } from '@nestjs/common';

import { GatekeeperPreflightService } from '../gatekeeper/gatekeeper-preflight.service';
import { AuditLogService } from '../platform-observability/audit-log.service';
import { EventOutboxService } from '../platform-observability/event-outbox.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigurationController } from './configuration.controller';
import { ConfigurationService } from './configuration.service';

@Module({
  controllers: [ConfigurationController],
  providers: [
    ConfigurationService,
    PrismaService,
    GatekeeperPreflightService,
    AuditLogService,
    EventOutboxService,
  ],
  exports: [ConfigurationService],
})
export class ConfigurationModule {}
