import { Module } from '@nestjs/common';

import { AccessCoreController } from './access-core/access-core.controller';
import { AccessCoreService } from './access-core/access-core.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationController } from './configuration/configuration.controller';
import { ConfigurationService } from './configuration/configuration.service';
import { EngagementGatewayController } from './engagement-gateway/engagement-gateway.controller';
import { EngagementGatewayService } from './engagement-gateway/engagement-gateway.service';
import { GatekeeperPreflightService } from './gatekeeper/gatekeeper-preflight.service';
import { HierarchyController } from './hierarchy/hierarchy.controller';
import { HierarchyClosureService } from './hierarchy/hierarchy-closure.service';
import { HierarchyService } from './hierarchy/hierarchy.service';
import { LeadDeskController } from './lead-desk/lead-desk.controller';
import { LeadDeskService } from './lead-desk/lead-desk.service';
import { ModuleRegistryController } from './module-registry/module-registry.controller';
import { ModuleRegistryService } from './module-registry/module-registry.service';
import { OrganizationSetupController } from './organization-setup/organization-setup.controller';
import { OrganizationSetupService } from './organization-setup/organization-setup.service';
import { AuditLogService } from './platform-observability/audit-log.service';
import { EventOutboxService } from './platform-observability/event-outbox.service';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [],
  controllers: [
    AppController,
    OrganizationSetupController,
    AccessCoreController,
    ModuleRegistryController,
    HierarchyController,
    ConfigurationController,
    EngagementGatewayController,
    LeadDeskController,
  ],
  providers: [
    AppService,
    PrismaService,
    ModuleRegistryService,
    OrganizationSetupService,
    HierarchyClosureService,
    HierarchyService,
    ConfigurationService,
    AccessCoreService,
    EngagementGatewayService,
    LeadDeskService,
    GatekeeperPreflightService,
    AuditLogService,
    EventOutboxService,
  ],
})
export class AppModule {}
