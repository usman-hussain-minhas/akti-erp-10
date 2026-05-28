import { Module } from '@nestjs/common';

import { AccessCoreController } from './access-core/access-core.controller';
import { AccessCoreService } from './access-core/access-core.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationModule } from './configuration/configuration.module';
import { EngagementGatewayController } from './engagement-gateway/engagement-gateway.controller';
import { EngagementGatewayService } from './engagement-gateway/engagement-gateway.service';
import { WhatsappStubProvider } from './engagement-gateway/whatsapp-stub.provider';
import { GatekeeperController } from './gatekeeper/gatekeeper.controller';
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
import { CurrentUserController } from './security/current-user.controller';
import { CurrentUserService } from './security/current-user.service';

@Module({
  imports: [ConfigurationModule],
  controllers: [
    AppController,
    CurrentUserController,
    OrganizationSetupController,
    AccessCoreController,
    ModuleRegistryController,
    HierarchyController,
    EngagementGatewayController,
    LeadDeskController,
    GatekeeperController,
  ],
  providers: [
    AppService,
    PrismaService,
    ModuleRegistryService,
    OrganizationSetupService,
    HierarchyClosureService,
    HierarchyService,
    AccessCoreService,
    EngagementGatewayService,
    WhatsappStubProvider,
    LeadDeskService,
    GatekeeperPreflightService,
    AuditLogService,
    EventOutboxService,
    CurrentUserService,
  ],
})
export class AppModule {}
