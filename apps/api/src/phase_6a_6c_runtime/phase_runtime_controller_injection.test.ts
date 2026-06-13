import 'reflect-metadata';

import { SELF_DECLARED_DEPS_METADATA } from '@nestjs/common/constants';

import { AccessCoreController } from '../access-core/access-core.controller';
import { AccessCoreService } from '../access-core/access-core.service';
import { AppController } from '../app.controller';
import { AppService } from '../app.service';
import { ConfigurationController } from '../configuration/configuration.controller';
import { ConfigurationService } from '../configuration/configuration.service';
import { DataControlsController } from '../data-controls/data-controls.controller';
import { DataControlsService } from '../data-controls/data-controls.service';
import { EngagementGatewayController } from '../engagement-gateway/engagement-gateway.controller';
import { EngagementGatewayService } from '../engagement-gateway/engagement-gateway.service';
import { FileServiceController } from '../file-service/file-service.controller';
import { FileService } from '../file-service/file-service.service';
import { FoundryController } from '../foundry/foundry.controller';
import { FoundryService } from '../foundry/foundry.service';
import { GatekeeperController } from '../gatekeeper/gatekeeper.controller';
import { GatekeeperPreflightService } from '../gatekeeper/gatekeeper-preflight.service';
import { HierarchyController } from '../hierarchy/hierarchy.controller';
import { HierarchyService } from '../hierarchy/hierarchy.service';
import { LeadDeskController } from '../lead-desk/lead-desk.controller';
import { LeadDeskService } from '../lead-desk/lead-desk.service';
import { ModuleRegistryController } from '../module-registry/module-registry.controller';
import { ModuleRegistryService } from '../module-registry/module-registry.service';
import { NotificationsController } from '../notifications/notifications.controller';
import { NotificationsService } from '../notifications/notifications.service';
import { OrganizationSetupController } from '../organization-setup/organization-setup.controller';
import { OrganizationSetupService } from '../organization-setup/organization-setup.service';
import { Phase6AController } from '../phase_6a/phase_6a.controller';
import { Phase6AService } from '../phase_6a/phase_6a.service';
import { Phase6BController } from '../phase_6b/phase_6b.controller';
import { Phase6BService } from '../phase_6b/phase_6b.service';
import { Phase6CController } from '../phase_6c/phase_6c.controller';
import { Phase6CService } from '../phase_6c/phase_6c.service';
import { PlatformHealthController } from '../platform-health/platform-health.controller';
import { ReportingController } from '../reporting/reporting.controller';
import { ReportingService } from '../reporting/reporting.service';
import { SearchController } from '../search/search.controller';
import { SearchService } from '../search/search.service';
import { CurrentUserController } from '../security/current-user.controller';
import { CurrentUserService } from '../security/current-user.service';
import { WorkflowController } from '../workflow/workflow.controller';
import { WorkflowService } from '../workflow/workflow.service';

type Constructor = new (...args: never[]) => unknown;

type ExplicitDependency = {
  index: number;
  param: unknown;
};

type ControllerDependencyExpectation = {
  controller: Constructor;
  token: unknown;
  label: string;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function getExplicitDependencies(controller: Constructor): ExplicitDependency[] {
  return (Reflect.getMetadata(SELF_DECLARED_DEPS_METADATA, controller) ?? []) as ExplicitDependency[];
}

function assertExplicitDependency(controller: Constructor, token: unknown, label: string) {
  const dependencies = getExplicitDependencies(controller);
  assert(
    dependencies.some((dependency) => dependency.index === 0 && dependency.param === token),
    `${label} must declare an explicit Nest injection token for its service`,
  );
}

const controllerDependencyExpectations: ControllerDependencyExpectation[] = [
  { controller: AccessCoreController, token: AccessCoreService, label: 'AccessCoreController' },
  { controller: AppController, token: AppService, label: 'AppController' },
  { controller: ConfigurationController, token: ConfigurationService, label: 'ConfigurationController' },
  { controller: DataControlsController, token: DataControlsService, label: 'DataControlsController' },
  { controller: EngagementGatewayController, token: EngagementGatewayService, label: 'EngagementGatewayController' },
  { controller: FileServiceController, token: FileService, label: 'FileServiceController' },
  { controller: FoundryController, token: FoundryService, label: 'FoundryController' },
  { controller: GatekeeperController, token: GatekeeperPreflightService, label: 'GatekeeperController' },
  { controller: HierarchyController, token: HierarchyService, label: 'HierarchyController' },
  { controller: LeadDeskController, token: LeadDeskService, label: 'LeadDeskController' },
  { controller: ModuleRegistryController, token: ModuleRegistryService, label: 'ModuleRegistryController' },
  { controller: NotificationsController, token: NotificationsService, label: 'NotificationsController' },
  { controller: OrganizationSetupController, token: OrganizationSetupService, label: 'OrganizationSetupController' },
  { controller: Phase6AController, token: Phase6AService, label: 'Phase6AController' },
  { controller: Phase6BController, token: Phase6BService, label: 'Phase6BController' },
  { controller: Phase6CController, token: Phase6CService, label: 'Phase6CController' },
  { controller: PlatformHealthController, token: ModuleRegistryService, label: 'PlatformHealthController' },
  { controller: ReportingController, token: ReportingService, label: 'ReportingController' },
  { controller: SearchController, token: SearchService, label: 'SearchController' },
  { controller: CurrentUserController, token: CurrentUserService, label: 'CurrentUserController' },
  { controller: WorkflowController, token: WorkflowService, label: 'WorkflowController' },
];

for (const expectation of controllerDependencyExpectations) {
  assertExplicitDependency(expectation.controller, expectation.token, expectation.label);
}

const appController = new AppController(new AppService());
assert(appController.getHealth().status === 'healthy', 'AppController health response must remain healthy');

const phase6AController = new Phase6AController(new Phase6AService());
const phase6AStatus = phase6AController.getRuntimeStatus();
assert(phase6AStatus.phase === '6A', 'Phase6AController runtime status must identify Phase 6A');
assert(phase6AStatus.active_surface_count === 0, 'Phase6AController must not activate surfaces by default');

const phase6BController = new Phase6BController(new Phase6BService());
const phase6BStatus = phase6BController.getRuntimeStatus();
assert(phase6BStatus.phase === '6B', 'Phase6BController runtime status must identify Phase 6B');
assert(phase6BStatus.active_surface_count === 0, 'Phase6BController must not activate surfaces by default');

const phase6CController = new Phase6CController(new Phase6CService());
const phase6CStatus = phase6CController.getRuntimeStatus();
assert(phase6CStatus.phase === '6C', 'Phase6CController runtime status must identify Phase 6C');
assert(phase6CStatus.active_surface_count === 0, 'Phase6CController must not activate surfaces by default');

console.log('phase runtime controller injection tests passed');
