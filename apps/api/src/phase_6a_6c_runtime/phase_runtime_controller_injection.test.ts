import 'reflect-metadata';

import { SELF_DECLARED_DEPS_METADATA } from '@nestjs/common/constants';

import { AppController } from '../app.controller';
import { AppService } from '../app.service';
import { Phase6AController } from '../phase_6a/phase_6a.controller';
import { Phase6AService } from '../phase_6a/phase_6a.service';
import { Phase6BController } from '../phase_6b/phase_6b.controller';
import { Phase6BService } from '../phase_6b/phase_6b.service';
import { Phase6CController } from '../phase_6c/phase_6c.controller';
import { Phase6CService } from '../phase_6c/phase_6c.service';

type Constructor = new (...args: never[]) => unknown;

type ExplicitDependency = {
  index: number;
  param: unknown;
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

assertExplicitDependency(AppController, AppService, 'AppController');
assertExplicitDependency(Phase6AController, Phase6AService, 'Phase6AController');
assertExplicitDependency(Phase6BController, Phase6BService, 'Phase6BController');
assertExplicitDependency(Phase6CController, Phase6CService, 'Phase6CController');

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
