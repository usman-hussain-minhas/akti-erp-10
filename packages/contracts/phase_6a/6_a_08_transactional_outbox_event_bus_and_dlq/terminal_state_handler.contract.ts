import type { Phase6AScaffoldSeed } from '../phase_6a_scaffold_control.contract.js';

export const phase6ATerminalStateHandlerContract = {
  seed_id: 'seed_6a_terminal_state_handler',
  source_component_id: '6A.08',
  seed_type: 'lifecycle_planning_seed',
  scaffold_domain: '6_a_08_transactional_outbox_event_bus_and_dlq',
  contract_path: 'packages/contracts/phase_6a/6_a_08_transactional_outbox_event_bus_and_dlq/terminal_state_handler.contract.ts',
  api_scaffold_path: 'apps/api/src/phase_6a/6_a_08_transactional_outbox_event_bus_and_dlq/terminal_state_handler.scaffold.ts',
  api_test_path: 'apps/api/src/phase_6a/6_a_08_transactional_outbox_event_bus_and_dlq/terminal_state_handler.scaffold.test.ts',
  capability_implementation_allowed: false,
  business_behavior_allowed: false,
  runtime_adapter_allowed: false,
} as const satisfies Phase6AScaffoldSeed;

export type Phase6ATerminalStateHandlerContract = typeof phase6ATerminalStateHandlerContract;
