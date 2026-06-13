import { Injectable } from '@nestjs/common';

export type Phase6AScaffoldReadiness = {
  phase: '6A';
  status: 'scaffold_control_only';
  seed_count: number;
  surface_count: number;
  seed_ids: string[];
  scaffold_domains: string[];
  capability_implementation_allowed: false;
  business_behavior_implemented: false;
  runtime_adapter_implemented: false;
  ticket_generation_allowed: false;
  ticket_pack_generation_allowed: false;
  execution_authorized: false;
};

export type Phase6ARuntimeSurface = {
  surface_key: string;
  source_ffet: string;
  source_surface: string;
  capability_surface: string;
  activation_required: true;
  active: boolean;
  runtime_exposure: 'status_only_until_foundry_enforced';
};

export type Phase6ARuntimeCapabilityStatus = {
  phase: '6A';
  status: 'runtime_surface_declared_activation_pending';
  activation_authority: 'foundry_runtime_authority';
  caller_controlled_activation_allowed: false;
  active_surface_count: number;
  inactive_surface_count: number;
  surfaces: Phase6ARuntimeSurface[];
};

export type Phase6AActivationSnapshot = {
  activeCapabilitySurfaces?: readonly string[];
};

const PHASE_6A_SEED_IDS = [
  "seed_6a_platform_core_update_baseline",
  "seed_6a_infrastructure_runtime_foundation",
  "seed_6a_svfs_object_store",
  "seed_6a_backup_engine",
  "seed_6a_image_pipeline",
  "seed_6a_soft_delete",
  "seed_6a_staged_deletion",
  "seed_6a_tenant_org_branch_session_identity",
  "seed_6a_person_identity_graph",
  "seed_6a_access_core_gatekeeper",
  "seed_6a_audit_log_universal_evidence_stream",
  "seed_6a_transactional_outbox",
  "seed_6a_event_bus_delivery",
  "seed_6a_dlq_admin_inspection_replay",
  "seed_6a_saga_orchestrator",
  "seed_6a_compensation_dispatcher",
  "seed_6a_terminal_state_handler",
  "seed_6a_pricing_table_effective_dates",
  "seed_6a_billing_dimension_measurement_registry",
  "seed_6a_evidence_aggregation",
  "seed_6a_projected_cost_calculator",
  "seed_6a_budget_caps",
  "seed_6a_prepaid_balance",
  "seed_6a_foundry_runtime_authority",
  "seed_6a_service_manifest_contract",
  "seed_6a_manifest_validation",
  "seed_6a_activation_dependency_resolution",
  "seed_6a_deactivation_dependency_blocking",
  "seed_6a_version_pin_and_rollback",
  "seed_6a_capability_registration",
  "seed_6a_pricing_reference_registration",
  "seed_6a_event_subscription_registration",
  "seed_6a_route_interface_registration",
  "seed_6a_frontend_chunk_registration",
  "seed_6a_global_opt_out_registry",
  "seed_6a_outbound_gateway_enforcement",
  "seed_6a_provider_circuit_breaker",
  "seed_6a_rate_limit_enforcement",
  "seed_6a_api_key_scope_registry",
  "seed_6a_idempotency_key_management",
  "seed_6a_webhook_definition_registry",
  "seed_6a_inbound_webhook_validation",
  "seed_6a_webhook_retry_schedule",
  "seed_6a_delivery_rejection_logs",
  "seed_6a_visual_workflow_builder",
  "seed_6a_lifecycle_builder",
  "seed_6a_rules_engine",
  "seed_6a_form_builder",
  "seed_6a_custom_fields",
  "seed_6a_template_library",
  "seed_6a_ai_configuration_wizard_foundation",
  "seed_6a_search_indexing",
  "seed_6a_custom_field_indexing_hook",
  "seed_6a_file_metadata_registry",
  "seed_6a_share_link_management",
  "seed_6a_preview_generation",
  "seed_6a_virus_scan_quarantine",
  "seed_6a_archive_version_boundary",
  "seed_6a_optimization_fact_store",
  "seed_6a_projected_cost_alternative_calculator",
  "seed_6a_dependency_aware_recommendation_log",
  "seed_6a_accepted_rejected_recommendation_evidence",
  "seed_6a_activation_deactivation_intercept_wizard",
  "seed_6a_model_routing",
  "seed_6a_data_classification_enforcement",
  "seed_6a_ai_cost_cap_enforcement",
  "seed_6a_per_query_credit_evidence_metering",
  "seed_6a_base_admin_setup",
  "seed_6a_industry_selection",
  "seed_6a_package_selection",
  "seed_6a_users_roles_billing_authority",
  "seed_6a_base_design_tokens",
  "seed_6a_core_component_contracts",
  "seed_6a_tenant_shell"
] as const;

const PHASE_6A_SCAFFOLD_DOMAINS = [
  "6_a_01_platform_core_update_baseline",
  "6_a_02_infrastructure_runtime_foundation",
  "6_a_03_storage_svfs_backup_and_image_pipeline",
  "6_a_04_tenant_organisation_branch_and_session_identity",
  "6_a_05_person_identity_graph",
  "6_a_06_access_core_and_gatekeeper",
  "6_a_07_audit_log_and_universal_evidence_stream",
  "6_a_08_transactional_outbox_event_bus_and_dlq",
  "6_a_09_core_billing_engine_and_pricing_registry",
  "6_a_10_foundry_runtime_authority",
  "6_a_11_communication_gateway_and_global_opt_out",
  "6_a_12_api_gateway_and_webhook_management",
  "6_a_13_configuration_engine",
  "6_a_14_search_and_file_service_layer",
  "6_a_15_non_ai_optimization_foundation",
  "6_a_16_ai_proxy_and_ai_governance_foundation",
  "6_a_17_base_admin_and_tenant_onboarding",
  "6_a_18_base_design_system_and_shell"
] as const;

const PHASE_6A_RUNTIME_SURFACES = [
  ["person_graph_multi_participant", "S1-6A6C-FFET-001", "person graph", "phase_6a.person_graph_multi_participant"],
  ["tiered_verification", "S1-6A6C-FFET-002", "tiered verification", "phase_6a.tiered_verification"],
  ["evidence_ledger_hardening", "S1-6A6C-FFET-003", "evidence ledger", "phase_6a.evidence_ledger_hardening"],
  ["reputation_interpretation_service", "S1-6A6C-FFET-004", "reputation interpretation", "phase_6a.reputation_interpretation_service"],
  ["communication_gateway", "S1-6A6C-FFET-005", "communication gateway", "phase_6a.communication_gateway"],
  ["configuration_constraints", "S1-6A6C-FFET-006", "configuration constraints", "phase_6a.configuration_constraints"],
  ["ai_proxy_dual_plane", "S1-6A6C-FFET-007", "AI proxy dual plane", "phase_6a.ai_proxy_dual_plane"],
  ["foundry_cross_tenant_activation", "S1-6A6C-FFET-008", "Foundry cross-tenant activation", "phase_6a.foundry_cross_tenant_activation"],
] as const;

@Injectable()
export class Phase6AService {
  getScaffoldReadiness(): Phase6AScaffoldReadiness {
    return {
      phase: '6A',
      status: 'scaffold_control_only',
      seed_count: PHASE_6A_SEED_IDS.length,
      surface_count: PHASE_6A_SCAFFOLD_DOMAINS.length,
      seed_ids: [...PHASE_6A_SEED_IDS],
      scaffold_domains: [...PHASE_6A_SCAFFOLD_DOMAINS],
      capability_implementation_allowed: false,
      business_behavior_implemented: false,
      runtime_adapter_implemented: false,
      ticket_generation_allowed: false,
      ticket_pack_generation_allowed: false,
      execution_authorized: false,
    };
  }

  getRuntimeCapabilityStatus(snapshot: Phase6AActivationSnapshot = {}): Phase6ARuntimeCapabilityStatus {
    const activeCapabilitySurfaces = new Set(snapshot.activeCapabilitySurfaces ?? []);
    const surfaces = PHASE_6A_RUNTIME_SURFACES.map(
      ([surface_key, source_ffet, source_surface, capability_surface]): Phase6ARuntimeSurface => ({
        surface_key,
        source_ffet,
        source_surface,
        capability_surface,
        activation_required: true,
        active: activeCapabilitySurfaces.has(capability_surface),
        runtime_exposure: 'status_only_until_foundry_enforced',
      }),
    );

    return {
      phase: '6A',
      status: 'runtime_surface_declared_activation_pending',
      activation_authority: 'foundry_runtime_authority',
      caller_controlled_activation_allowed: false,
      active_surface_count: surfaces.filter((surface) => surface.active).length,
      inactive_surface_count: surfaces.filter((surface) => !surface.active).length,
      surfaces,
    };
  }
}
