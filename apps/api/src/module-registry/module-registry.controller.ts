import { Controller, Get } from '@nestjs/common';

import { ModuleRegistryService } from './module-registry.service';

@Controller('platform/modules')
export class ModuleRegistryController {
  constructor(private readonly moduleRegistryService: ModuleRegistryService) {}

  @Get()
  listModules() {
    return this.moduleRegistryService.listModules();
  }
}
