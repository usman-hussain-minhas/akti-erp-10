import { Module } from '@nestjs/common';

import { AccessCoreController } from './access-core/access-core.controller';
import { AccessCoreService } from './access-core/access-core.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HierarchyClosureService } from './hierarchy/hierarchy-closure.service';
import { OrganizationSetupController } from './organization-setup/organization-setup.controller';
import { OrganizationSetupService } from './organization-setup/organization-setup.service';
import { AuditLogService } from './platform-observability/audit-log.service';
import { EventOutboxService } from './platform-observability/event-outbox.service';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [],
  controllers: [AppController, OrganizationSetupController, AccessCoreController],
  providers: [
    AppService,
    PrismaService,
    OrganizationSetupService,
    HierarchyClosureService,
    AccessCoreService,
    AuditLogService,
    EventOutboxService,
  ],
})
export class AppModule {}
