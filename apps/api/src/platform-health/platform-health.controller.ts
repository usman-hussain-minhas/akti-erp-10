import { Controller, Get, Headers } from '@nestjs/common';

import { ModuleRegistryService } from '../module-registry/module-registry.service';
import { HeaderRecord, resolveTrustedRequestContext } from '../security/request-context';

type PlatformHealthStatus = 'healthy' | 'degraded';

type ModuleHealthStatus = 'healthy' | 'degraded' | 'disabled' | 'blocked';

const HEALTHY_MODULE_STATUSES = new Set(['available', 'installable', 'installed', 'enabled']);
const DEGRADED_MODULE_STATUSES = new Set(['disabled', 'update_available', 'updating', 'rollback_required', 'retiring']);
const BLOCKED_MODULE_STATUSES = new Set(['blocked', 'uninstalled']);

@Controller('platform/health')
export class PlatformHealthController {
  constructor(private readonly moduleRegistryService: ModuleRegistryService) {}

  @Get()
  async getPlatformHealth(@Headers() headers: HeaderRecord) {
    const context = resolveTrustedRequestContext(headers);
    const modules = await this.moduleRegistryService.listModules();
    const moduleSummaries = modules.items.map((item) => ({
      module_key: item.module_key,
      display_name: item.display_name,
      version: item.version,
      status: item.status,
      health_status: this.mapModuleStatusToHealth(item.status),
    }));
    const degradedModules = moduleSummaries.filter((item) => item.health_status !== 'healthy');
    const status: PlatformHealthStatus = degradedModules.length > 0 ? 'degraded' : 'healthy';

    return {
      route: '/platform/health',
      status,
      tenant_context: {
        organization_id: context.organization_id,
        actor_user_id: context.actor_user_id,
      },
      capability: {
        required: 'platform.shell.access',
      },
      gatekeeper: {
        read_requires_preflight: false,
        lifecycle_mutation_requires_preflight: true,
      },
      checks: [
        {
          key: 'platform.api',
          status: 'healthy',
          critical: true,
        },
        {
          key: 'platform.module-registry',
          status,
          critical: true,
        },
      ],
      modules: {
        total: moduleSummaries.length,
        healthy: moduleSummaries.filter((item) => item.health_status === 'healthy').length,
        degraded: moduleSummaries.filter((item) => item.health_status === 'degraded').length,
        disabled: moduleSummaries.filter((item) => item.health_status === 'disabled').length,
        blocked: moduleSummaries.filter((item) => item.health_status === 'blocked').length,
        items: moduleSummaries,
      },
      degraded_modules: degradedModules,
      audit: {
        event_type: 'platform.health.read',
        outbox_event_required: false,
      },
    };
  }

  private mapModuleStatusToHealth(status: string): ModuleHealthStatus {
    if (HEALTHY_MODULE_STATUSES.has(status)) {
      return 'healthy';
    }
    if (DEGRADED_MODULE_STATUSES.has(status)) {
      return 'degraded';
    }
    if (BLOCKED_MODULE_STATUSES.has(status)) {
      return 'blocked';
    }

    return 'disabled';
  }
}
