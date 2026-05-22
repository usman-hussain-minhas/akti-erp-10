import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HierarchyClosureService } from './hierarchy/hierarchy-closure.service';
import { OrganizationSetupController } from './organization-setup/organization-setup.controller';
import { OrganizationSetupService } from './organization-setup/organization-setup.service';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [],
  controllers: [AppController, OrganizationSetupController],
  providers: [AppService, PrismaService, OrganizationSetupService, HierarchyClosureService],
})
export class AppModule {}
