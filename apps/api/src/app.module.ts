import { Module } from '@nestjs/common';

import { AccessCoreController } from './access-core/access-core.controller';
import { AccessCoreService } from './access-core/access-core.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationModule } from './configuration/configuration.module';
import { DataControlsController } from './data-controls/data-controls.controller';
import { DataControlsService } from './data-controls/data-controls.service';
import { EngagementGatewayController } from './engagement-gateway/engagement-gateway.controller';
import { EngagementGatewayService } from './engagement-gateway/engagement-gateway.service';
import { WhatsappStubProvider } from './engagement-gateway/whatsapp-stub.provider';
import { FileServiceController } from './file-service/file-service.controller';
import { FileService } from './file-service/file-service.service';
import { FoundryController } from './foundry/foundry.controller';
import { FoundryService } from './foundry/foundry.service';
import { GatekeeperController } from './gatekeeper/gatekeeper.controller';
import { GatekeeperPreflightService } from './gatekeeper/gatekeeper-preflight.service';
import { HierarchyController } from './hierarchy/hierarchy.controller';
import { HierarchyClosureService } from './hierarchy/hierarchy-closure.service';
import { HierarchyService } from './hierarchy/hierarchy.service';
import { LeadDeskController } from './lead-desk/lead-desk.controller';
import { LeadDeskService } from './lead-desk/lead-desk.service';
import { ModuleRegistryModule } from './module-registry/module-registry.module';
import { NotificationsController } from './notifications/notifications.controller';
import { NotificationsService } from './notifications/notifications.service';
import { OrganizationSetupController } from './organization-setup/organization-setup.controller';
import { OrganizationSetupService } from './organization-setup/organization-setup.service';
import { PlatformHealthController } from './platform-health/platform-health.controller';
import { AuditLogService } from './platform-observability/audit-log.service';
import { EventOutboxService } from './platform-observability/event-outbox.service';
import { PrismaService } from './prisma/prisma.service';
import { ReportingController } from './reporting/reporting.controller';
import { ReportingService } from './reporting/reporting.service';
import { SearchController } from './search/search.controller';
import { SearchService } from './search/search.service';
import { CurrentUserController } from './security/current-user.controller';
import { CurrentUserService } from './security/current-user.service';
import { WorkflowController } from './workflow/workflow.controller';
import { WorkflowService } from './workflow/workflow.service';

@Module({
  imports: [ConfigurationModule, ModuleRegistryModule],
  controllers: [
    AppController,
    CurrentUserController,
    OrganizationSetupController,
    AccessCoreController,
    HierarchyController,
    EngagementGatewayController,
    LeadDeskController,
    GatekeeperController,
    FoundryController,
    WorkflowController,
    SearchController,
    FileServiceController,
    ReportingController,
    PlatformHealthController,
    NotificationsController,
    DataControlsController,
  ],
  providers: [
    AppService,
    PrismaService,
    OrganizationSetupService,
    HierarchyClosureService,
    HierarchyService,
    AccessCoreService,
    EngagementGatewayService,
    WhatsappStubProvider,
    LeadDeskService,
    GatekeeperPreflightService,
    FoundryService,
    AuditLogService,
    EventOutboxService,
    CurrentUserService,
    WorkflowService,
    SearchService,
    FileService,
    ReportingService,
    NotificationsService,
    DataControlsService,
  ],
})
export class AppModule {}
