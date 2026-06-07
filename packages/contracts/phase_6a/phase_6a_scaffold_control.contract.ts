export type Phase6AScaffoldSeed = {
  seed_id: string;
  source_component_id: string;
  seed_type: string;
  scaffold_domain: string;
  contract_path: string;
  api_scaffold_path: string;
  api_test_path: string;
  capability_implementation_allowed: false;
  business_behavior_allowed: false;
  runtime_adapter_allowed: false;
};

export type Phase6AScaffoldSurface = {
  component_id: string;
  module_key: string;
  display_name: string;
  scaffold_domain: string;
  seed_ids: string[];
  capability_implementation_allowed: false;
  business_behavior_allowed: false;
  runtime_adapter_allowed: false;
};

export type Phase6AScaffoldControlSnapshot = {
  phase: '6A';
  status: 'scaffold_control_only';
  ticket_generation_allowed: false;
  ticket_pack_generation_allowed: false;
  capability_execution_allowed: false;
  seeds: Phase6AScaffoldSeed[];
  surfaces: Phase6AScaffoldSurface[];
};

export const phase6AScaffoldSeeds = [
  {
    seed_id: 'seed_6a_platform_core_update_baseline',
    source_component_id: '6A.01',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_01_platform_core_update_baseline',
    contract_path: 'packages/contracts/phase_6a/6_a_01_platform_core_update_baseline/platform_core_update_baseline.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_01_platform_core_update_baseline/platform_core_update_baseline.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_01_platform_core_update_baseline/platform_core_update_baseline.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_infrastructure_runtime_foundation',
    source_component_id: '6A.02',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_02_infrastructure_runtime_foundation',
    contract_path: 'packages/contracts/phase_6a/6_a_02_infrastructure_runtime_foundation/infrastructure_runtime_foundation.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_02_infrastructure_runtime_foundation/infrastructure_runtime_foundation.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_02_infrastructure_runtime_foundation/infrastructure_runtime_foundation.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_svfs_object_store',
    source_component_id: '6A.03',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_03_storage_svfs_backup_and_image_pipeline',
    contract_path: 'packages/contracts/phase_6a/6_a_03_storage_svfs_backup_and_image_pipeline/svfs_object_store.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_03_storage_svfs_backup_and_image_pipeline/svfs_object_store.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_03_storage_svfs_backup_and_image_pipeline/svfs_object_store.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_backup_engine',
    source_component_id: '6A.03',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_03_storage_svfs_backup_and_image_pipeline',
    contract_path: 'packages/contracts/phase_6a/6_a_03_storage_svfs_backup_and_image_pipeline/backup_engine.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_03_storage_svfs_backup_and_image_pipeline/backup_engine.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_03_storage_svfs_backup_and_image_pipeline/backup_engine.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_image_pipeline',
    source_component_id: '6A.03',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_03_storage_svfs_backup_and_image_pipeline',
    contract_path: 'packages/contracts/phase_6a/6_a_03_storage_svfs_backup_and_image_pipeline/image_pipeline.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_03_storage_svfs_backup_and_image_pipeline/image_pipeline.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_03_storage_svfs_backup_and_image_pipeline/image_pipeline.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_soft_delete',
    source_component_id: '6A.03',
    seed_type: 'lifecycle_planning_seed',
    scaffold_domain: '6_a_03_storage_svfs_backup_and_image_pipeline',
    contract_path: 'packages/contracts/phase_6a/6_a_03_storage_svfs_backup_and_image_pipeline/soft_delete.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_03_storage_svfs_backup_and_image_pipeline/soft_delete.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_03_storage_svfs_backup_and_image_pipeline/soft_delete.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_staged_deletion',
    source_component_id: '6A.03',
    seed_type: 'lifecycle_planning_seed',
    scaffold_domain: '6_a_03_storage_svfs_backup_and_image_pipeline',
    contract_path: 'packages/contracts/phase_6a/6_a_03_storage_svfs_backup_and_image_pipeline/staged_deletion.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_03_storage_svfs_backup_and_image_pipeline/staged_deletion.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_03_storage_svfs_backup_and_image_pipeline/staged_deletion.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_tenant_org_branch_session_identity',
    source_component_id: '6A.04',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_04_tenant_organisation_branch_and_session_identity',
    contract_path: 'packages/contracts/phase_6a/6_a_04_tenant_organisation_branch_and_session_identity/tenant_org_branch_session_identity.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_04_tenant_organisation_branch_and_session_identity/tenant_org_branch_session_identity.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_04_tenant_organisation_branch_and_session_identity/tenant_org_branch_session_identity.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_person_identity_graph',
    source_component_id: '6A.05',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_05_person_identity_graph',
    contract_path: 'packages/contracts/phase_6a/6_a_05_person_identity_graph/person_identity_graph.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_05_person_identity_graph/person_identity_graph.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_05_person_identity_graph/person_identity_graph.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_access_core_gatekeeper',
    source_component_id: '6A.06',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_06_access_core_and_gatekeeper',
    contract_path: 'packages/contracts/phase_6a/6_a_06_access_core_and_gatekeeper/access_core_gatekeeper.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_06_access_core_and_gatekeeper/access_core_gatekeeper.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_06_access_core_and_gatekeeper/access_core_gatekeeper.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_audit_log_universal_evidence_stream',
    source_component_id: '6A.07',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_07_audit_log_and_universal_evidence_stream',
    contract_path: 'packages/contracts/phase_6a/6_a_07_audit_log_and_universal_evidence_stream/audit_log_universal_evidence_stream.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_07_audit_log_and_universal_evidence_stream/audit_log_universal_evidence_stream.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_07_audit_log_and_universal_evidence_stream/audit_log_universal_evidence_stream.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_transactional_outbox',
    source_component_id: '6A.08',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_08_transactional_outbox_event_bus_and_dlq',
    contract_path: 'packages/contracts/phase_6a/6_a_08_transactional_outbox_event_bus_and_dlq/transactional_outbox.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_08_transactional_outbox_event_bus_and_dlq/transactional_outbox.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_08_transactional_outbox_event_bus_and_dlq/transactional_outbox.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_event_bus_delivery',
    source_component_id: '6A.08',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_08_transactional_outbox_event_bus_and_dlq',
    contract_path: 'packages/contracts/phase_6a/6_a_08_transactional_outbox_event_bus_and_dlq/event_bus_delivery.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_08_transactional_outbox_event_bus_and_dlq/event_bus_delivery.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_08_transactional_outbox_event_bus_and_dlq/event_bus_delivery.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_dlq_admin_inspection_replay',
    source_component_id: '6A.08',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_08_transactional_outbox_event_bus_and_dlq',
    contract_path: 'packages/contracts/phase_6a/6_a_08_transactional_outbox_event_bus_and_dlq/dlq_admin_inspection_replay.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_08_transactional_outbox_event_bus_and_dlq/dlq_admin_inspection_replay.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_08_transactional_outbox_event_bus_and_dlq/dlq_admin_inspection_replay.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_saga_orchestrator',
    source_component_id: '6A.08',
    seed_type: 'lifecycle_planning_seed',
    scaffold_domain: '6_a_08_transactional_outbox_event_bus_and_dlq',
    contract_path: 'packages/contracts/phase_6a/6_a_08_transactional_outbox_event_bus_and_dlq/saga_orchestrator.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_08_transactional_outbox_event_bus_and_dlq/saga_orchestrator.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_08_transactional_outbox_event_bus_and_dlq/saga_orchestrator.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_compensation_dispatcher',
    source_component_id: '6A.08',
    seed_type: 'lifecycle_planning_seed',
    scaffold_domain: '6_a_08_transactional_outbox_event_bus_and_dlq',
    contract_path: 'packages/contracts/phase_6a/6_a_08_transactional_outbox_event_bus_and_dlq/compensation_dispatcher.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_08_transactional_outbox_event_bus_and_dlq/compensation_dispatcher.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_08_transactional_outbox_event_bus_and_dlq/compensation_dispatcher.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_terminal_state_handler',
    source_component_id: '6A.08',
    seed_type: 'lifecycle_planning_seed',
    scaffold_domain: '6_a_08_transactional_outbox_event_bus_and_dlq',
    contract_path: 'packages/contracts/phase_6a/6_a_08_transactional_outbox_event_bus_and_dlq/terminal_state_handler.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_08_transactional_outbox_event_bus_and_dlq/terminal_state_handler.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_08_transactional_outbox_event_bus_and_dlq/terminal_state_handler.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_pricing_table_effective_dates',
    source_component_id: '6A.09',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_09_core_billing_engine_and_pricing_registry',
    contract_path: 'packages/contracts/phase_6a/6_a_09_core_billing_engine_and_pricing_registry/pricing_table_effective_dates.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_09_core_billing_engine_and_pricing_registry/pricing_table_effective_dates.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_09_core_billing_engine_and_pricing_registry/pricing_table_effective_dates.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_billing_dimension_measurement_registry',
    source_component_id: '6A.09',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_09_core_billing_engine_and_pricing_registry',
    contract_path: 'packages/contracts/phase_6a/6_a_09_core_billing_engine_and_pricing_registry/billing_dimension_measurement_registry.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_09_core_billing_engine_and_pricing_registry/billing_dimension_measurement_registry.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_09_core_billing_engine_and_pricing_registry/billing_dimension_measurement_registry.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_evidence_aggregation',
    source_component_id: '6A.09',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_09_core_billing_engine_and_pricing_registry',
    contract_path: 'packages/contracts/phase_6a/6_a_09_core_billing_engine_and_pricing_registry/evidence_aggregation.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_09_core_billing_engine_and_pricing_registry/evidence_aggregation.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_09_core_billing_engine_and_pricing_registry/evidence_aggregation.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_projected_cost_calculator',
    source_component_id: '6A.09',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_09_core_billing_engine_and_pricing_registry',
    contract_path: 'packages/contracts/phase_6a/6_a_09_core_billing_engine_and_pricing_registry/projected_cost_calculator.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_09_core_billing_engine_and_pricing_registry/projected_cost_calculator.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_09_core_billing_engine_and_pricing_registry/projected_cost_calculator.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_budget_caps',
    source_component_id: '6A.09',
    seed_type: 'lifecycle_planning_seed',
    scaffold_domain: '6_a_09_core_billing_engine_and_pricing_registry',
    contract_path: 'packages/contracts/phase_6a/6_a_09_core_billing_engine_and_pricing_registry/budget_caps.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_09_core_billing_engine_and_pricing_registry/budget_caps.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_09_core_billing_engine_and_pricing_registry/budget_caps.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_prepaid_balance',
    source_component_id: '6A.09',
    seed_type: 'lifecycle_planning_seed',
    scaffold_domain: '6_a_09_core_billing_engine_and_pricing_registry',
    contract_path: 'packages/contracts/phase_6a/6_a_09_core_billing_engine_and_pricing_registry/prepaid_balance.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_09_core_billing_engine_and_pricing_registry/prepaid_balance.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_09_core_billing_engine_and_pricing_registry/prepaid_balance.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_foundry_runtime_authority',
    source_component_id: '6A.10',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_10_foundry_runtime_authority',
    contract_path: 'packages/contracts/phase_6a/6_a_10_foundry_runtime_authority/foundry_runtime_authority.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_10_foundry_runtime_authority/foundry_runtime_authority.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_10_foundry_runtime_authority/foundry_runtime_authority.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_service_manifest_contract',
    source_component_id: '6A.10',
    seed_type: 'foundry_manifest_lifecycle_planning_seed',
    scaffold_domain: '6_a_10_foundry_runtime_authority',
    contract_path: 'packages/contracts/phase_6a/6_a_10_foundry_runtime_authority/service_manifest_contract.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_10_foundry_runtime_authority/service_manifest_contract.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_10_foundry_runtime_authority/service_manifest_contract.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_manifest_validation',
    source_component_id: '6A.10',
    seed_type: 'foundry_manifest_lifecycle_planning_seed',
    scaffold_domain: '6_a_10_foundry_runtime_authority',
    contract_path: 'packages/contracts/phase_6a/6_a_10_foundry_runtime_authority/manifest_validation.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_10_foundry_runtime_authority/manifest_validation.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_10_foundry_runtime_authority/manifest_validation.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_activation_dependency_resolution',
    source_component_id: '6A.10',
    seed_type: 'foundry_manifest_lifecycle_planning_seed',
    scaffold_domain: '6_a_10_foundry_runtime_authority',
    contract_path: 'packages/contracts/phase_6a/6_a_10_foundry_runtime_authority/activation_dependency_resolution.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_10_foundry_runtime_authority/activation_dependency_resolution.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_10_foundry_runtime_authority/activation_dependency_resolution.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_deactivation_dependency_blocking',
    source_component_id: '6A.10',
    seed_type: 'foundry_manifest_lifecycle_planning_seed',
    scaffold_domain: '6_a_10_foundry_runtime_authority',
    contract_path: 'packages/contracts/phase_6a/6_a_10_foundry_runtime_authority/deactivation_dependency_blocking.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_10_foundry_runtime_authority/deactivation_dependency_blocking.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_10_foundry_runtime_authority/deactivation_dependency_blocking.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_version_pin_and_rollback',
    source_component_id: '6A.10',
    seed_type: 'foundry_manifest_lifecycle_planning_seed',
    scaffold_domain: '6_a_10_foundry_runtime_authority',
    contract_path: 'packages/contracts/phase_6a/6_a_10_foundry_runtime_authority/version_pin_and_rollback.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_10_foundry_runtime_authority/version_pin_and_rollback.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_10_foundry_runtime_authority/version_pin_and_rollback.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_capability_registration',
    source_component_id: '6A.10',
    seed_type: 'foundry_manifest_lifecycle_planning_seed',
    scaffold_domain: '6_a_10_foundry_runtime_authority',
    contract_path: 'packages/contracts/phase_6a/6_a_10_foundry_runtime_authority/capability_registration.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_10_foundry_runtime_authority/capability_registration.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_10_foundry_runtime_authority/capability_registration.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_pricing_reference_registration',
    source_component_id: '6A.10',
    seed_type: 'foundry_manifest_lifecycle_planning_seed',
    scaffold_domain: '6_a_10_foundry_runtime_authority',
    contract_path: 'packages/contracts/phase_6a/6_a_10_foundry_runtime_authority/pricing_reference_registration.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_10_foundry_runtime_authority/pricing_reference_registration.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_10_foundry_runtime_authority/pricing_reference_registration.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_event_subscription_registration',
    source_component_id: '6A.10',
    seed_type: 'foundry_manifest_lifecycle_planning_seed',
    scaffold_domain: '6_a_10_foundry_runtime_authority',
    contract_path: 'packages/contracts/phase_6a/6_a_10_foundry_runtime_authority/event_subscription_registration.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_10_foundry_runtime_authority/event_subscription_registration.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_10_foundry_runtime_authority/event_subscription_registration.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_route_interface_registration',
    source_component_id: '6A.10',
    seed_type: 'foundry_manifest_lifecycle_planning_seed',
    scaffold_domain: '6_a_10_foundry_runtime_authority',
    contract_path: 'packages/contracts/phase_6a/6_a_10_foundry_runtime_authority/route_interface_registration.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_10_foundry_runtime_authority/route_interface_registration.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_10_foundry_runtime_authority/route_interface_registration.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_frontend_chunk_registration',
    source_component_id: '6A.10',
    seed_type: 'foundry_manifest_lifecycle_planning_seed',
    scaffold_domain: '6_a_10_foundry_runtime_authority',
    contract_path: 'packages/contracts/phase_6a/6_a_10_foundry_runtime_authority/frontend_chunk_registration.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_10_foundry_runtime_authority/frontend_chunk_registration.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_10_foundry_runtime_authority/frontend_chunk_registration.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_global_opt_out_registry',
    source_component_id: '6A.11',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_11_communication_gateway_and_global_opt_out',
    contract_path: 'packages/contracts/phase_6a/6_a_11_communication_gateway_and_global_opt_out/global_opt_out_registry.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_11_communication_gateway_and_global_opt_out/global_opt_out_registry.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_11_communication_gateway_and_global_opt_out/global_opt_out_registry.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_outbound_gateway_enforcement',
    source_component_id: '6A.11',
    seed_type: 'provider_or_channel_planning_seed',
    scaffold_domain: '6_a_11_communication_gateway_and_global_opt_out',
    contract_path: 'packages/contracts/phase_6a/6_a_11_communication_gateway_and_global_opt_out/outbound_gateway_enforcement.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_11_communication_gateway_and_global_opt_out/outbound_gateway_enforcement.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_11_communication_gateway_and_global_opt_out/outbound_gateway_enforcement.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_provider_circuit_breaker',
    source_component_id: '6A.11',
    seed_type: 'provider_or_channel_planning_seed',
    scaffold_domain: '6_a_11_communication_gateway_and_global_opt_out',
    contract_path: 'packages/contracts/phase_6a/6_a_11_communication_gateway_and_global_opt_out/provider_circuit_breaker.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_11_communication_gateway_and_global_opt_out/provider_circuit_breaker.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_11_communication_gateway_and_global_opt_out/provider_circuit_breaker.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_rate_limit_enforcement',
    source_component_id: '6A.11',
    seed_type: 'provider_or_channel_planning_seed',
    scaffold_domain: '6_a_11_communication_gateway_and_global_opt_out',
    contract_path: 'packages/contracts/phase_6a/6_a_11_communication_gateway_and_global_opt_out/rate_limit_enforcement.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_11_communication_gateway_and_global_opt_out/rate_limit_enforcement.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_11_communication_gateway_and_global_opt_out/rate_limit_enforcement.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_api_key_scope_registry',
    source_component_id: '6A.12',
    seed_type: 'provider_or_channel_planning_seed',
    scaffold_domain: '6_a_12_api_gateway_and_webhook_management',
    contract_path: 'packages/contracts/phase_6a/6_a_12_api_gateway_and_webhook_management/api_key_scope_registry.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_12_api_gateway_and_webhook_management/api_key_scope_registry.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_12_api_gateway_and_webhook_management/api_key_scope_registry.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_idempotency_key_management',
    source_component_id: '6A.12',
    seed_type: 'lifecycle_planning_seed',
    scaffold_domain: '6_a_12_api_gateway_and_webhook_management',
    contract_path: 'packages/contracts/phase_6a/6_a_12_api_gateway_and_webhook_management/idempotency_key_management.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_12_api_gateway_and_webhook_management/idempotency_key_management.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_12_api_gateway_and_webhook_management/idempotency_key_management.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_webhook_definition_registry',
    source_component_id: '6A.12',
    seed_type: 'provider_or_channel_planning_seed',
    scaffold_domain: '6_a_12_api_gateway_and_webhook_management',
    contract_path: 'packages/contracts/phase_6a/6_a_12_api_gateway_and_webhook_management/webhook_definition_registry.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_12_api_gateway_and_webhook_management/webhook_definition_registry.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_12_api_gateway_and_webhook_management/webhook_definition_registry.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_inbound_webhook_validation',
    source_component_id: '6A.12',
    seed_type: 'provider_or_channel_planning_seed',
    scaffold_domain: '6_a_12_api_gateway_and_webhook_management',
    contract_path: 'packages/contracts/phase_6a/6_a_12_api_gateway_and_webhook_management/inbound_webhook_validation.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_12_api_gateway_and_webhook_management/inbound_webhook_validation.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_12_api_gateway_and_webhook_management/inbound_webhook_validation.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_webhook_retry_schedule',
    source_component_id: '6A.12',
    seed_type: 'lifecycle_planning_seed',
    scaffold_domain: '6_a_12_api_gateway_and_webhook_management',
    contract_path: 'packages/contracts/phase_6a/6_a_12_api_gateway_and_webhook_management/webhook_retry_schedule.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_12_api_gateway_and_webhook_management/webhook_retry_schedule.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_12_api_gateway_and_webhook_management/webhook_retry_schedule.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_delivery_rejection_logs',
    source_component_id: '6A.12',
    seed_type: 'provider_or_channel_planning_seed',
    scaffold_domain: '6_a_12_api_gateway_and_webhook_management',
    contract_path: 'packages/contracts/phase_6a/6_a_12_api_gateway_and_webhook_management/delivery_rejection_logs.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_12_api_gateway_and_webhook_management/delivery_rejection_logs.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_12_api_gateway_and_webhook_management/delivery_rejection_logs.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_visual_workflow_builder',
    source_component_id: '6A.13',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_13_configuration_engine',
    contract_path: 'packages/contracts/phase_6a/6_a_13_configuration_engine/visual_workflow_builder.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_13_configuration_engine/visual_workflow_builder.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_13_configuration_engine/visual_workflow_builder.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_lifecycle_builder',
    source_component_id: '6A.13',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_13_configuration_engine',
    contract_path: 'packages/contracts/phase_6a/6_a_13_configuration_engine/lifecycle_builder.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_13_configuration_engine/lifecycle_builder.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_13_configuration_engine/lifecycle_builder.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_rules_engine',
    source_component_id: '6A.13',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_13_configuration_engine',
    contract_path: 'packages/contracts/phase_6a/6_a_13_configuration_engine/rules_engine.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_13_configuration_engine/rules_engine.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_13_configuration_engine/rules_engine.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_form_builder',
    source_component_id: '6A.13',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_13_configuration_engine',
    contract_path: 'packages/contracts/phase_6a/6_a_13_configuration_engine/form_builder.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_13_configuration_engine/form_builder.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_13_configuration_engine/form_builder.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_custom_fields',
    source_component_id: '6A.13',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_13_configuration_engine',
    contract_path: 'packages/contracts/phase_6a/6_a_13_configuration_engine/custom_fields.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_13_configuration_engine/custom_fields.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_13_configuration_engine/custom_fields.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_template_library',
    source_component_id: '6A.13',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_13_configuration_engine',
    contract_path: 'packages/contracts/phase_6a/6_a_13_configuration_engine/template_library.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_13_configuration_engine/template_library.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_13_configuration_engine/template_library.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_ai_configuration_wizard_foundation',
    source_component_id: '6A.13',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_13_configuration_engine',
    contract_path: 'packages/contracts/phase_6a/6_a_13_configuration_engine/ai_configuration_wizard_foundation.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_13_configuration_engine/ai_configuration_wizard_foundation.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_13_configuration_engine/ai_configuration_wizard_foundation.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_search_indexing',
    source_component_id: '6A.14',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_14_search_and_file_service_layer',
    contract_path: 'packages/contracts/phase_6a/6_a_14_search_and_file_service_layer/search_indexing.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_14_search_and_file_service_layer/search_indexing.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_14_search_and_file_service_layer/search_indexing.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_custom_field_indexing_hook',
    source_component_id: '6A.14',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_14_search_and_file_service_layer',
    contract_path: 'packages/contracts/phase_6a/6_a_14_search_and_file_service_layer/custom_field_indexing_hook.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_14_search_and_file_service_layer/custom_field_indexing_hook.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_14_search_and_file_service_layer/custom_field_indexing_hook.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_file_metadata_registry',
    source_component_id: '6A.14',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_14_search_and_file_service_layer',
    contract_path: 'packages/contracts/phase_6a/6_a_14_search_and_file_service_layer/file_metadata_registry.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_14_search_and_file_service_layer/file_metadata_registry.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_14_search_and_file_service_layer/file_metadata_registry.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_share_link_management',
    source_component_id: '6A.14',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_14_search_and_file_service_layer',
    contract_path: 'packages/contracts/phase_6a/6_a_14_search_and_file_service_layer/share_link_management.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_14_search_and_file_service_layer/share_link_management.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_14_search_and_file_service_layer/share_link_management.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_preview_generation',
    source_component_id: '6A.14',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_14_search_and_file_service_layer',
    contract_path: 'packages/contracts/phase_6a/6_a_14_search_and_file_service_layer/preview_generation.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_14_search_and_file_service_layer/preview_generation.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_14_search_and_file_service_layer/preview_generation.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_virus_scan_quarantine',
    source_component_id: '6A.14',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_14_search_and_file_service_layer',
    contract_path: 'packages/contracts/phase_6a/6_a_14_search_and_file_service_layer/virus_scan_quarantine.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_14_search_and_file_service_layer/virus_scan_quarantine.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_14_search_and_file_service_layer/virus_scan_quarantine.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_archive_version_boundary',
    source_component_id: '6A.14',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_14_search_and_file_service_layer',
    contract_path: 'packages/contracts/phase_6a/6_a_14_search_and_file_service_layer/archive_version_boundary.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_14_search_and_file_service_layer/archive_version_boundary.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_14_search_and_file_service_layer/archive_version_boundary.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_optimization_fact_store',
    source_component_id: '6A.15',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_15_non_ai_optimization_foundation',
    contract_path: 'packages/contracts/phase_6a/6_a_15_non_ai_optimization_foundation/optimization_fact_store.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_15_non_ai_optimization_foundation/optimization_fact_store.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_15_non_ai_optimization_foundation/optimization_fact_store.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_projected_cost_alternative_calculator',
    source_component_id: '6A.15',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_15_non_ai_optimization_foundation',
    contract_path: 'packages/contracts/phase_6a/6_a_15_non_ai_optimization_foundation/projected_cost_alternative_calculator.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_15_non_ai_optimization_foundation/projected_cost_alternative_calculator.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_15_non_ai_optimization_foundation/projected_cost_alternative_calculator.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_dependency_aware_recommendation_log',
    source_component_id: '6A.15',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_15_non_ai_optimization_foundation',
    contract_path: 'packages/contracts/phase_6a/6_a_15_non_ai_optimization_foundation/dependency_aware_recommendation_log.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_15_non_ai_optimization_foundation/dependency_aware_recommendation_log.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_15_non_ai_optimization_foundation/dependency_aware_recommendation_log.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_accepted_rejected_recommendation_evidence',
    source_component_id: '6A.15',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_15_non_ai_optimization_foundation',
    contract_path: 'packages/contracts/phase_6a/6_a_15_non_ai_optimization_foundation/accepted_rejected_recommendation_evidence.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_15_non_ai_optimization_foundation/accepted_rejected_recommendation_evidence.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_15_non_ai_optimization_foundation/accepted_rejected_recommendation_evidence.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_activation_deactivation_intercept_wizard',
    source_component_id: '6A.15',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_15_non_ai_optimization_foundation',
    contract_path: 'packages/contracts/phase_6a/6_a_15_non_ai_optimization_foundation/activation_deactivation_intercept_wizard.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_15_non_ai_optimization_foundation/activation_deactivation_intercept_wizard.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_15_non_ai_optimization_foundation/activation_deactivation_intercept_wizard.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_model_routing',
    source_component_id: '6A.16',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_16_ai_proxy_and_ai_governance_foundation',
    contract_path: 'packages/contracts/phase_6a/6_a_16_ai_proxy_and_ai_governance_foundation/model_routing.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_16_ai_proxy_and_ai_governance_foundation/model_routing.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_16_ai_proxy_and_ai_governance_foundation/model_routing.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_data_classification_enforcement',
    source_component_id: '6A.16',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_16_ai_proxy_and_ai_governance_foundation',
    contract_path: 'packages/contracts/phase_6a/6_a_16_ai_proxy_and_ai_governance_foundation/data_classification_enforcement.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_16_ai_proxy_and_ai_governance_foundation/data_classification_enforcement.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_16_ai_proxy_and_ai_governance_foundation/data_classification_enforcement.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_ai_cost_cap_enforcement',
    source_component_id: '6A.16',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_16_ai_proxy_and_ai_governance_foundation',
    contract_path: 'packages/contracts/phase_6a/6_a_16_ai_proxy_and_ai_governance_foundation/ai_cost_cap_enforcement.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_16_ai_proxy_and_ai_governance_foundation/ai_cost_cap_enforcement.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_16_ai_proxy_and_ai_governance_foundation/ai_cost_cap_enforcement.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_per_query_credit_evidence_metering',
    source_component_id: '6A.16',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_16_ai_proxy_and_ai_governance_foundation',
    contract_path: 'packages/contracts/phase_6a/6_a_16_ai_proxy_and_ai_governance_foundation/per_query_credit_evidence_metering.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_16_ai_proxy_and_ai_governance_foundation/per_query_credit_evidence_metering.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_16_ai_proxy_and_ai_governance_foundation/per_query_credit_evidence_metering.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_base_admin_setup',
    source_component_id: '6A.17',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_17_base_admin_and_tenant_onboarding',
    contract_path: 'packages/contracts/phase_6a/6_a_17_base_admin_and_tenant_onboarding/base_admin_setup.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_17_base_admin_and_tenant_onboarding/base_admin_setup.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_17_base_admin_and_tenant_onboarding/base_admin_setup.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_industry_selection',
    source_component_id: '6A.17',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_17_base_admin_and_tenant_onboarding',
    contract_path: 'packages/contracts/phase_6a/6_a_17_base_admin_and_tenant_onboarding/industry_selection.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_17_base_admin_and_tenant_onboarding/industry_selection.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_17_base_admin_and_tenant_onboarding/industry_selection.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_package_selection',
    source_component_id: '6A.17',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_17_base_admin_and_tenant_onboarding',
    contract_path: 'packages/contracts/phase_6a/6_a_17_base_admin_and_tenant_onboarding/package_selection.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_17_base_admin_and_tenant_onboarding/package_selection.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_17_base_admin_and_tenant_onboarding/package_selection.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_users_roles_billing_authority',
    source_component_id: '6A.17',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_17_base_admin_and_tenant_onboarding',
    contract_path: 'packages/contracts/phase_6a/6_a_17_base_admin_and_tenant_onboarding/users_roles_billing_authority.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_17_base_admin_and_tenant_onboarding/users_roles_billing_authority.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_17_base_admin_and_tenant_onboarding/users_roles_billing_authority.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_base_design_tokens',
    source_component_id: '6A.18',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_18_base_design_system_and_shell',
    contract_path: 'packages/contracts/phase_6a/6_a_18_base_design_system_and_shell/base_design_tokens.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_18_base_design_system_and_shell/base_design_tokens.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_18_base_design_system_and_shell/base_design_tokens.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_core_component_contracts',
    source_component_id: '6A.18',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_18_base_design_system_and_shell',
    contract_path: 'packages/contracts/phase_6a/6_a_18_base_design_system_and_shell/core_component_contracts.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_18_base_design_system_and_shell/core_component_contracts.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_18_base_design_system_and_shell/core_component_contracts.scaffold.test.ts',
  },
  {
    seed_id: 'seed_6a_tenant_shell',
    source_component_id: '6A.18',
    seed_type: 'core_planning_seed',
    scaffold_domain: '6_a_18_base_design_system_and_shell',
    contract_path: 'packages/contracts/phase_6a/6_a_18_base_design_system_and_shell/tenant_shell.contract.ts',
    api_scaffold_path: 'apps/api/src/phase_6a/6_a_18_base_design_system_and_shell/tenant_shell.scaffold.ts',
    api_test_path: 'apps/api/src/phase_6a/6_a_18_base_design_system_and_shell/tenant_shell.scaffold.test.ts',
  },
].map((seed) => ({
  ...seed,
  capability_implementation_allowed: false,
  business_behavior_allowed: false,
  runtime_adapter_allowed: false,
})) satisfies Phase6AScaffoldSeed[];

export const phase6AScaffoldSurfaces = [
  {
    component_id: '6A.01',
    module_key: 'phase-6a.6-a-01-platform-core-update-baseline',
    display_name: 'Phase 6A Platform Core Update Baseline',
    scaffold_domain: '6_a_01_platform_core_update_baseline',
    seed_ids: [
      'seed_6a_platform_core_update_baseline',
    ],
  },
  {
    component_id: '6A.02',
    module_key: 'phase-6a.6-a-02-infrastructure-runtime-foundation',
    display_name: 'Phase 6A Infrastructure Runtime Foundation',
    scaffold_domain: '6_a_02_infrastructure_runtime_foundation',
    seed_ids: [
      'seed_6a_infrastructure_runtime_foundation',
    ],
  },
  {
    component_id: '6A.03',
    module_key: 'phase-6a.6-a-03-storage-svfs-backup-and-image-pipeline',
    display_name: 'Phase 6A Storage, SVFS, Backup, and Image Pipeline',
    scaffold_domain: '6_a_03_storage_svfs_backup_and_image_pipeline',
    seed_ids: [
      'seed_6a_svfs_object_store',
      'seed_6a_backup_engine',
      'seed_6a_image_pipeline',
      'seed_6a_soft_delete',
      'seed_6a_staged_deletion',
    ],
  },
  {
    component_id: '6A.04',
    module_key: 'phase-6a.6-a-04-tenant-organisation-branch-and-session-identity',
    display_name: 'Phase 6A Tenant, Organisation, Branch, and Session Identity',
    scaffold_domain: '6_a_04_tenant_organisation_branch_and_session_identity',
    seed_ids: [
      'seed_6a_tenant_org_branch_session_identity',
    ],
  },
  {
    component_id: '6A.05',
    module_key: 'phase-6a.6-a-05-person-identity-graph',
    display_name: 'Phase 6A Person / Identity Graph',
    scaffold_domain: '6_a_05_person_identity_graph',
    seed_ids: [
      'seed_6a_person_identity_graph',
    ],
  },
  {
    component_id: '6A.06',
    module_key: 'phase-6a.6-a-06-access-core-and-gatekeeper',
    display_name: 'Phase 6A Access Core and Gatekeeper',
    scaffold_domain: '6_a_06_access_core_and_gatekeeper',
    seed_ids: [
      'seed_6a_access_core_gatekeeper',
    ],
  },
  {
    component_id: '6A.07',
    module_key: 'phase-6a.6-a-07-audit-log-and-universal-evidence-stream',
    display_name: 'Phase 6A Audit Log and Universal Evidence Stream',
    scaffold_domain: '6_a_07_audit_log_and_universal_evidence_stream',
    seed_ids: [
      'seed_6a_audit_log_universal_evidence_stream',
    ],
  },
  {
    component_id: '6A.08',
    module_key: 'phase-6a.6-a-08-transactional-outbox-event-bus-and-dlq',
    display_name: 'Phase 6A Transactional Outbox, Event Bus, and DLQ',
    scaffold_domain: '6_a_08_transactional_outbox_event_bus_and_dlq',
    seed_ids: [
      'seed_6a_transactional_outbox',
      'seed_6a_event_bus_delivery',
      'seed_6a_dlq_admin_inspection_replay',
      'seed_6a_saga_orchestrator',
      'seed_6a_compensation_dispatcher',
      'seed_6a_terminal_state_handler',
    ],
  },
  {
    component_id: '6A.09',
    module_key: 'phase-6a.6-a-09-core-billing-engine-and-pricing-registry',
    display_name: 'Phase 6A Core Billing Engine and Pricing Registry',
    scaffold_domain: '6_a_09_core_billing_engine_and_pricing_registry',
    seed_ids: [
      'seed_6a_pricing_table_effective_dates',
      'seed_6a_billing_dimension_measurement_registry',
      'seed_6a_evidence_aggregation',
      'seed_6a_projected_cost_calculator',
      'seed_6a_budget_caps',
      'seed_6a_prepaid_balance',
    ],
  },
  {
    component_id: '6A.10',
    module_key: 'phase-6a.6-a-10-foundry-runtime-authority',
    display_name: 'Phase 6A Foundry Runtime Authority',
    scaffold_domain: '6_a_10_foundry_runtime_authority',
    seed_ids: [
      'seed_6a_foundry_runtime_authority',
      'seed_6a_service_manifest_contract',
      'seed_6a_manifest_validation',
      'seed_6a_activation_dependency_resolution',
      'seed_6a_deactivation_dependency_blocking',
      'seed_6a_version_pin_and_rollback',
      'seed_6a_capability_registration',
      'seed_6a_pricing_reference_registration',
      'seed_6a_event_subscription_registration',
      'seed_6a_route_interface_registration',
      'seed_6a_frontend_chunk_registration',
    ],
  },
  {
    component_id: '6A.11',
    module_key: 'phase-6a.6-a-11-communication-gateway-and-global-opt-out',
    display_name: 'Phase 6A Communication Gateway and Global Opt-Out',
    scaffold_domain: '6_a_11_communication_gateway_and_global_opt_out',
    seed_ids: [
      'seed_6a_global_opt_out_registry',
      'seed_6a_outbound_gateway_enforcement',
      'seed_6a_provider_circuit_breaker',
      'seed_6a_rate_limit_enforcement',
    ],
  },
  {
    component_id: '6A.12',
    module_key: 'phase-6a.6-a-12-api-gateway-and-webhook-management',
    display_name: 'Phase 6A API Gateway and Webhook Management',
    scaffold_domain: '6_a_12_api_gateway_and_webhook_management',
    seed_ids: [
      'seed_6a_api_key_scope_registry',
      'seed_6a_idempotency_key_management',
      'seed_6a_webhook_definition_registry',
      'seed_6a_inbound_webhook_validation',
      'seed_6a_webhook_retry_schedule',
      'seed_6a_delivery_rejection_logs',
    ],
  },
  {
    component_id: '6A.13',
    module_key: 'phase-6a.6-a-13-configuration-engine',
    display_name: 'Phase 6A Configuration Engine',
    scaffold_domain: '6_a_13_configuration_engine',
    seed_ids: [
      'seed_6a_visual_workflow_builder',
      'seed_6a_lifecycle_builder',
      'seed_6a_rules_engine',
      'seed_6a_form_builder',
      'seed_6a_custom_fields',
      'seed_6a_template_library',
      'seed_6a_ai_configuration_wizard_foundation',
    ],
  },
  {
    component_id: '6A.14',
    module_key: 'phase-6a.6-a-14-search-and-file-service-layer',
    display_name: 'Phase 6A Search and File Service Layer',
    scaffold_domain: '6_a_14_search_and_file_service_layer',
    seed_ids: [
      'seed_6a_search_indexing',
      'seed_6a_custom_field_indexing_hook',
      'seed_6a_file_metadata_registry',
      'seed_6a_share_link_management',
      'seed_6a_preview_generation',
      'seed_6a_virus_scan_quarantine',
      'seed_6a_archive_version_boundary',
    ],
  },
  {
    component_id: '6A.15',
    module_key: 'phase-6a.6-a-15-non-ai-optimization-foundation',
    display_name: 'Phase 6A Non-AI Optimization Foundation',
    scaffold_domain: '6_a_15_non_ai_optimization_foundation',
    seed_ids: [
      'seed_6a_optimization_fact_store',
      'seed_6a_projected_cost_alternative_calculator',
      'seed_6a_dependency_aware_recommendation_log',
      'seed_6a_accepted_rejected_recommendation_evidence',
      'seed_6a_activation_deactivation_intercept_wizard',
    ],
  },
  {
    component_id: '6A.16',
    module_key: 'phase-6a.6-a-16-ai-proxy-and-ai-governance-foundation',
    display_name: 'Phase 6A AI Proxy and AI Governance Foundation',
    scaffold_domain: '6_a_16_ai_proxy_and_ai_governance_foundation',
    seed_ids: [
      'seed_6a_model_routing',
      'seed_6a_data_classification_enforcement',
      'seed_6a_ai_cost_cap_enforcement',
      'seed_6a_per_query_credit_evidence_metering',
    ],
  },
  {
    component_id: '6A.17',
    module_key: 'phase-6a.6-a-17-base-admin-and-tenant-onboarding',
    display_name: 'Phase 6A Base Admin and Tenant Onboarding',
    scaffold_domain: '6_a_17_base_admin_and_tenant_onboarding',
    seed_ids: [
      'seed_6a_base_admin_setup',
      'seed_6a_industry_selection',
      'seed_6a_package_selection',
      'seed_6a_users_roles_billing_authority',
    ],
  },
  {
    component_id: '6A.18',
    module_key: 'phase-6a.6-a-18-base-design-system-and-shell',
    display_name: 'Phase 6A Base Design System and Shell',
    scaffold_domain: '6_a_18_base_design_system_and_shell',
    seed_ids: [
      'seed_6a_base_design_tokens',
      'seed_6a_core_component_contracts',
      'seed_6a_tenant_shell',
    ],
  },
].map((surface) => ({
  ...surface,
  capability_implementation_allowed: false,
  business_behavior_allowed: false,
  runtime_adapter_allowed: false,
})) satisfies Phase6AScaffoldSurface[];

export const phase6AScaffoldControlSnapshot: Phase6AScaffoldControlSnapshot = {
  phase: '6A',
  status: 'scaffold_control_only',
  ticket_generation_allowed: false,
  ticket_pack_generation_allowed: false,
  capability_execution_allowed: false,
  seeds: phase6AScaffoldSeeds,
  surfaces: phase6AScaffoldSurfaces,
};

export function assertPhase6AScaffoldControlSnapshot(snapshot: Phase6AScaffoldControlSnapshot): void {
  const seenSeeds = new Set<string>();
  const seenFiles = new Set<string>();
  const seenSurfaces = new Set<string>();

  for (const seed of snapshot.seeds) {
    if (seenSeeds.has(seed.seed_id)) {
      throw new Error(`Duplicate Phase 6A scaffold seed: ${seed.seed_id}`);
    }
    seenSeeds.add(seed.seed_id);

    for (const filePath of [seed.contract_path, seed.api_scaffold_path, seed.api_test_path]) {
      if (!filePath.startsWith('packages/contracts/phase_6a/') && !filePath.startsWith('apps/api/src/phase_6a/')) {
        throw new Error(`Phase 6A scaffold path is outside approved roots: ${filePath}`);
      }
      if (seenFiles.has(filePath)) {
        throw new Error(`Duplicate Phase 6A scaffold file ownership: ${filePath}`);
      }
      seenFiles.add(filePath);
    }

    if (seed.capability_implementation_allowed || seed.business_behavior_allowed || seed.runtime_adapter_allowed) {
      throw new Error(`Phase 6A scaffold seed ${seed.seed_id} must not authorize capability behavior`);
    }
  }

  for (const surface of snapshot.surfaces) {
    if (seenSurfaces.has(surface.module_key)) {
      throw new Error(`Duplicate Phase 6A scaffold module key: ${surface.module_key}`);
    }
    seenSurfaces.add(surface.module_key);
    if (surface.seed_ids.length === 0) {
      throw new Error(`Phase 6A scaffold surface ${surface.module_key} must own at least one seed`);
    }
    if (surface.capability_implementation_allowed || surface.business_behavior_allowed || surface.runtime_adapter_allowed) {
      throw new Error(`Phase 6A scaffold surface ${surface.module_key} must not authorize capability behavior`);
    }
  }

  if (snapshot.ticket_generation_allowed || snapshot.ticket_pack_generation_allowed || snapshot.capability_execution_allowed) {
    throw new Error('Phase 6A scaffold control must keep ticket generation and execution disabled');
  }

  if (seenSeeds.size !== 74) {
    throw new Error(`Expected 74 Phase 6A scaffold seeds; got ${seenSeeds.size}`);
  }
  if (snapshot.surfaces.length !== 18) {
    throw new Error(`Expected 18 Phase 6A scaffold surfaces; got ${snapshot.surfaces.length}`);
  }
}

assertPhase6AScaffoldControlSnapshot(phase6AScaffoldControlSnapshot);
