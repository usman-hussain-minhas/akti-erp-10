# Spark Platform v4.1 Phase 6A Sub-Surface Catalog Audit v1

Status: SPARK_PLATFORM_V4_1_PHASE_6A_SUBSURFACE_CATALOG_AUDIT_READY_FOR_REVIEW


## Current Final State Summary

- Sub-surfaces: 74
- Source components: 18
- Surfaces: 14
## Summary

- Surfaces: 14
- Sub-surfaces: 74
- Missing required splits: 0
- Ticket generation authorized: no

## Checks

- PASS: every source component maps to at least one surface/sub-surface.
- PASS: every required split exists.
- PASS: every sub-surface has source_component_id.
- PASS: every sub-surface has parent_surface_id and parent resolves.
- PASS: every required split axis is recorded.
- PASS: readiness_mode is PREPLANNING_DRAFT everywhere.
- PASS: ticket_generation_allowed is false everywhere.
- PASS: no exact implementation file paths are invented as authority.
- PASS: manifest_required / foundry_activation_required consistency is preserved.

## Foundry Manifest and Activation Gate

- PASS: foundry_runtime_authority exists.
- PASS: service_manifest_contract exists.
- PASS: manifest_validation exists.
- PASS: activation_dependency_resolution exists.
- PASS: deactivation_dependency_blocking exists.
- PASS: version_pin_and_rollback exists.
- PASS: capability_registration exists.
- PASS: pricing_reference_registration exists.
- PASS: event_subscription_registration exists.
- PASS: route_interface_registration exists.
- PASS: frontend_chunk_registration exists.
- PASS: all relevant activatable/configurable Phase 6A sub-surfaces declare manifest/Foundry traceability to service_manifest_contract unless source-grounded rationale says otherwise.
- PASS: no unrelated core primitive is blanket-linked to all Foundry sub-surfaces.
- PASS: no activatable service uses foundry_runtime_authority as the default substitute for service_manifest_contract.

## Self-Heal Attempts

- None. Stage reached READY without self-heal.

## Review Patch - Parent/Child Manifest Consistency

- Parent/child manifest consistency was reviewed for 6A.11, 6A.12, 6A.14, 6A.16, 6A.17, and 6A.18.
- 6A.11 and 6A.12 retain parent-level non-toggleable core-boundary status, with child-specific rationale for service_manifest_contract traceability.
- 6A.14 now records a precise false/false rationale because no child sub-surface requires manifest traceability.
- 6A.16 now records manifest_required=true with foundry_activation_required=false because all four AI governance child sub-surfaces require manifest traceability but are not tenant-toggleable marketplace services.
- service_manifest_contract remains the manifest traceability target for activatable/configurable child surfaces; no blanket Foundry linkage was added.

## Semantic Gates Patch - Foundry bootstrap direction

Foundry bootstrap direction is confirmed and not re-created.

- foundry_runtime_authority is the bootstrap root for the Foundry lifecycle cluster.
- service_manifest_contract depends on foundry_runtime_authority.
- foundry_runtime_authority does not depend on service_manifest_contract and is not activated by its own manifest contract.
- Activatable/configurable service-like surfaces depend on service_manifest_contract for manifest traceability.
- No duplicate reverse Foundry edge was added.

## Semantic Gates Patch - wrapper-ticket depth sufficiency

wrapper-ticket risk was reduced by replacing broad 6A.12, 6A.14, and 6A.15 planning IDs with source-stable split IDs.

- 6A.12 split result: api_key_scope_registry, idempotency_key_management, webhook_definition_registry, inbound_webhook_validation, webhook_retry_schedule, delivery_rejection_logs.
- 6A.14 split result: search_indexing, custom_field_indexing_hook, file_metadata_registry, share_link_management, preview_generation, virus_scan_quarantine, archive_version_boundary.
- 6A.15 split result: optimization_fact_store, projected_cost_alternative_calculator, dependency_aware_recommendation_log, accepted_rejected_recommendation_evidence, activation_deactivation_intercept_wizard.
- Stale broad IDs are not retained as active sub-surfaces or seeds.

## Semantic Gates Patch - New Split Seed Manifest Classification

Current live state: 5 / 18 new split seeds require service_manifest_contract; 13 / 18 do not. This is intentional and not a validation failure.

| seed_id | source_component_id | requires_service_manifest_contract | classification | rationale |
|---|---|---:|---|---|
| seed_6a_api_key_scope_registry | 6A.12 | true | configurable API boundary | API key scopes are tenant-configurable and need manifest traceability. |
| seed_6a_idempotency_key_management | 6A.12 | false | internal write-safety primitive | Core idempotency primitive, not independently activatable. |
| seed_6a_webhook_definition_registry | 6A.12 | true | provider-facing configurable registry | Webhook definitions are provider-facing configuration. |
| seed_6a_inbound_webhook_validation | 6A.12 | true | provider-facing validation boundary | Provider traffic validation is a configurable boundary. |
| seed_6a_webhook_retry_schedule | 6A.12 | false | internal lifecycle primitive | Retry scheduling inherits webhook context and is not independently activatable. |
| seed_6a_delivery_rejection_logs | 6A.12 | false | evidence/logging primitive | Rejection logs are evidence records, not service activation surfaces. |
| seed_6a_search_indexing | 6A.14 | false | core indexing primitive | Core service-layer primitive, not tenant-toggleable. |
| seed_6a_custom_field_indexing_hook | 6A.14 | false | conditional indexing hook | Conditional on custom fields; not independently activatable. |
| seed_6a_file_metadata_registry | 6A.14 | false | core file registry | Core file metadata primitive. |
| seed_6a_share_link_management | 6A.14 | false | internal file lifecycle | File access lifecycle, not a Foundry service. |
| seed_6a_preview_generation | 6A.14 | false | internal rendering support | Preview support surface, not independently activatable. |
| seed_6a_virus_scan_quarantine | 6A.14 | false | safety/evidence lifecycle | Quarantine safety primitive. |
| seed_6a_archive_version_boundary | 6A.14 | false | archive/version lifecycle | Retention/version boundary, not tenant-toggleable. |
| seed_6a_optimization_fact_store | 6A.15 | true | configurable optimization service boundary | Service-aware optimization fact store requires manifest traceability. |
| seed_6a_projected_cost_alternative_calculator | 6A.15 | false | internal calculation primitive | Depends on optimization facts and projected-cost primitives; not independently activatable. |
| seed_6a_dependency_aware_recommendation_log | 6A.15 | true | configurable recommendation evidence surface | Service dependency context requires manifest traceability. |
| seed_6a_accepted_rejected_recommendation_evidence | 6A.15 | false | decision evidence primitive | Evidence record of recommendation choices. |
| seed_6a_activation_deactivation_intercept_wizard | 6A.15 | false | lifecycle intercept primitive | Inherits Foundry lifecycle context through activation/dependency and recommendation seeds. |
