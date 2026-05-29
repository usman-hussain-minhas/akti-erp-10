import { BadRequestException, Controller, Get, Headers, Param } from '@nestjs/common';

import { ModuleRegistryService } from './module-registry.service';
import { HeaderRecord, resolveTrustedRequestContext } from '../security/request-context';

const MODULE_KEY_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:\.[a-z][a-z0-9]*(?:-[a-z0-9]+)*)+$/;

function validateModuleKeyParam(raw: string) {
  const value = raw?.trim();
  if (!MODULE_KEY_PATTERN.test(value)) {
    throw new BadRequestException('module_key must use module key syntax');
  }
  return value;
}

@Controller('platform/modules')
export class ModuleRegistryController {
  constructor(private readonly moduleRegistryService: ModuleRegistryService) {}

  @Get()
  listModules(@Headers() headers?: HeaderRecord) {
    if (headers === undefined) {
      return this.moduleRegistryService.listModules();
    }

    const context = resolveTrustedRequestContext(headers);
    return this.moduleRegistryService.listModulesForActor({
      organization_id: context.organization_id,
      actor_user_id: context.actor_user_id,
    });
  }

  @Get('frontend')
  getFrontendRegistry(@Headers() headers: HeaderRecord) {
    const context = resolveTrustedRequestContext(headers);
    return this.moduleRegistryService.getFrontendRegistry({
      organization_id: context.organization_id,
      actor_user_id: context.actor_user_id,
    });
  }

  @Get(':module_key/lifecycle-status')
  getLifecycleStatus(
    @Param('module_key') moduleKeyRaw: string,
    @Headers() headers: HeaderRecord,
  ) {
    const moduleKey = validateModuleKeyParam(moduleKeyRaw);
    const context = resolveTrustedRequestContext(headers);
    return this.moduleRegistryService.getModuleLifecycleStatus({
      module_key: moduleKey,
      organization_id: context.organization_id,
      actor_user_id: context.actor_user_id,
    });
  }
}
