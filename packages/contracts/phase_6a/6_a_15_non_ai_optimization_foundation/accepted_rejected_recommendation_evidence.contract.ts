import type { Phase6AScaffoldSeed } from '../phase_6a_scaffold_control.contract.js';

export const phase6AAcceptedRejectedRecommendationEvidenceContract = {
  seed_id: 'seed_6a_accepted_rejected_recommendation_evidence',
  source_component_id: '6A.15',
  seed_type: 'core_planning_seed',
  scaffold_domain: '6_a_15_non_ai_optimization_foundation',
  contract_path: 'packages/contracts/phase_6a/6_a_15_non_ai_optimization_foundation/accepted_rejected_recommendation_evidence.contract.ts',
  api_scaffold_path: 'apps/api/src/phase_6a/6_a_15_non_ai_optimization_foundation/accepted_rejected_recommendation_evidence.scaffold.ts',
  api_test_path: 'apps/api/src/phase_6a/6_a_15_non_ai_optimization_foundation/accepted_rejected_recommendation_evidence.scaffold.test.ts',
  capability_implementation_allowed: false,
  business_behavior_allowed: false,
  runtime_adapter_allowed: false,
} as const satisfies Phase6AScaffoldSeed;

export type Phase6AAcceptedRejectedRecommendationEvidenceContract = typeof phase6AAcceptedRejectedRecommendationEvidenceContract;
