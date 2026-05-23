import { Module } from '@nestjs/common';

import { AccessCoreController } from './access-core/access-core.controller';
import { AccessCoreService } from './access-core/access-core.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GatekeeperPreflightService } from './gatekeeper/gatekeeper-preflight.service';
import { HierarchyClosureService } from './hierarchy/hierarchy-closure.service';
import { ModuleRegistryController } from './module-registry/module-registry.controller';
import { ModuleRegistryService } from './module-registry/module-registry.service';
import { OrganizationSetupController } from './organization-setup/organization-setup.controller';
import { OrganizationSetupService } from './organization-setup/organization-setup.service';
import { AuditLogService } from './platform-observability/audit-log.service';
import { EventOutboxService } from './platform-observability/event-outbox.service';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [],
  controllers: [AppController, OrganizationSetupController, AccessCoreController, ModuleRegistryController],
  providers: [
    AppService,
    PrismaService,
    ModuleRegistryService,
    OrganizationSetupService,
    HierarchyClosureService,
    AccessCoreService,
    GatekeeperPreflightService,
    AuditLogService,
    EventOutboxService,
  ],
})
export class AppModule {}
