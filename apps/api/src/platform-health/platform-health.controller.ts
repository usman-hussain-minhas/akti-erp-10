import { Controller, Get, Headers } from '@nestjs/common';

import { ModuleRegistryService } from '../module-registry/module-registry.service';
import { StructuredLoggerService } from '../platform-observability/structured-logger.service';
import { HeaderRecord, resolveTrustedRequestContext } from '../security/request-context';

type PlatformHealthStatus = 'healthy' | 'degraded';

type ModuleHealthStatus = 'healthy' | 'degraded' | 'disabled' | 'blocked';

const HEALTHY_MODULE_STATUSES = new Set(['available', 'installable', 'installed', 'enabled']);
const DEGRADED_MODULE_STATUSES = new Set(['disabled', 'update_available', 'updating', 'rollback_required', 'retiring']);
const BLOCKED_MODULE_STATUSES = new Set(['blocked', 'uninstalled']);
const PLATFORM_HEALTH_SLO_TARGETS = {
  availability_target_percent: 99.5,
  latency_p95_target_ms: 500,
  max_degraded_modules: 0,
  max_blocked_modules: 0,
} as const;

@Controller('platform/health')
export class PlatformHealthController {
  private readonly structuredLoggerService = new StructuredLoggerService();

  constructor(private readonly moduleRegistryService: ModuleRegistryService) {}

  @Get()
  async getPlatformHealth(@Headers() headers: HeaderRecord) {
    const context = resolveTrustedRequestContext(headers);
    const correlationId = this.resolveCorrelationId(headers, context.organization_id, context.actor_user_id);
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
    const sloTelemetry = this.buildSloTelemetry({
      organization_id: context.organization_id,
      actor_user_id: context.actor_user_id,
      correlation_id: correlationId,
      status,
      module_count: moduleSummaries.length,
      healthy_count: moduleSummaries.filter((item) => item.health_status === 'healthy').length,
      degraded_count: moduleSummaries.filter((item) => item.health_status === 'degraded').length,
      blocked_count: moduleSummaries.filter((item) => item.health_status === 'blocked').length,
    });

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
      slo: sloTelemetry.slo,
      telemetry: {
        structured_log: sloTelemetry.structured_log,
      },
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

  private resolveCorrelationId(headers: HeaderRecord, organizationId: string, actorUserId: string) {
    const raw = headers['x-correlation-id'];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }

    return `platform-health.${organizationId}.${actorUserId}`;
  }

  private buildSloTelemetry(input: {
    organization_id: string;
    actor_user_id: string;
    correlation_id: string;
    status: PlatformHealthStatus;
    module_count: number;
    healthy_count: number;
    degraded_count: number;
    blocked_count: number;
  }) {
    const targetMet =
      input.status === 'healthy' &&
      input.degraded_count <= PLATFORM_HEALTH_SLO_TARGETS.max_degraded_modules &&
      input.blocked_count <= PLATFORM_HEALTH_SLO_TARGETS.max_blocked_modules;
    const slo = {
      telemetry_baseline: true,
      source: 'platform.health',
      status: input.status,
      target_met: targetMet,
      targets: PLATFORM_HEALTH_SLO_TARGETS,
      measurement: {
        module_count: input.module_count,
        healthy_count: input.healthy_count,
        degraded_count: input.degraded_count,
        blocked_count: input.blocked_count,
      },
    };

    return {
      slo,
      structured_log: this.structuredLoggerService.buildEntry({
        level: targetMet ? 'info' : 'warn',
        message: 'Platform health SLO telemetry baseline recorded.',
        organization_id: input.organization_id,
        actor_user_id: input.actor_user_id,
        correlation_id: input.correlation_id,
        source_module: 'platform-health',
        action_key: 'platform.health.read',
        entity_type: 'platform.health',
        entity_id: null,
        metadata: {
          slo,
        },
      }),
    };
  }
}
