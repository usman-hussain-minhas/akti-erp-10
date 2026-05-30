import { Module } from '@nestjs/common';

import { ModuleRegistryController } from './module-registry.controller';
import { ModuleRegistryService } from './module-registry.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ModuleRegistryController],
  providers: [ModuleRegistryService, PrismaService],
  exports: [ModuleRegistryService],
})
export class ModuleRegistryModule {}
