# Phase 6B Semantic Derivation Audit v1

Status: READY

## Current Final State Summary

Source components: 15
Sub-surfaces: 102
Seeds: 102
Dependency edges: 473
Extraction edges: 473
Extraction edge distribution: hard_dependency=465 / deferred_with_reason=0 / conditional_dependency=0 / manual_review_required=8
Top-level seed dependency references: 465
Root seeds: 0
Current root seeds: []


Source components: 15
Sub-surfaces: 102
Seeds: 102
Dependency edges: 473
Extraction edges: 473
Extraction edge distribution: hard_dependency=465 / deferred_with_reason=0 / conditional_dependency=0 / manual_review_required=8
Top-level seed dependency references: 465
Root seed count: 0
Current root seeds: []

## Explicit Semantic Gate Results

| Check | Result | Evidence |
| --- | --- | --- |
| mixed manifest classification exists and is source-grounded | PASS | manifest_required true=92, false=10 |
| inverse_manifest_dependency_gate | PASS | manifest_required=false seeds with service_manifest_contract dependency=0 |
| manifest_activation_consistency_gate | PASS | manifest_required=false and foundry_activation_required=true count=0 |
| every row has seed_type | PASS | row_count=102; seed_type_distribution={"tenant_service":74,"internal_lifecycle_primitive":3,"core_microservice":11,"evidence_primitive":5,"audit_log_primitive":2,"provider_adapter":7} |
| every row has adl_refs and manifest_traceability_targets | PASS | lowercase fields present on every row |
| forbidden fields absent | PASS | ADL_refs, ADL_scope_status, manifest_traceability_target absent |
| source-attached ADLs represented or not_applicable_with_reason | PASS | adl_distribution={"none":87,"ADL-015":2,"ADL-013":2,"ADL-021":5,"ADL-004":2,"ADL-014":1,"ADL-016":2,"ADL-018":1} |
| edge basis is not flattened | PASS | edge_basis_distribution={"activation_lifecycle_required":92,"billing_or_evidence_required":313,"adl_hard_rule":60} |
| split-parent target selection rejects first-child default | PASS | semantic dependency target map row_count=465 |
| provider adapters are not default provider-neutral targets | PASS | provider-specific targets require source-grounded selected target basis |
| broad phase tokens unresolved | PASS | no broad phase token remains in Phase 6B target map |
| parent inheritance rationale is source-specific | PASS | generic inheritance reason count=0 |
| ambiguous mappings use manual_review_required | PASS | manual_review_required rows=0 |
| pricing-model family classification reviewed | PASS | pricing variants classified as configuration_extension/non-manifest unless source-grounded otherwise |
| mechanical audit alone is insufficient | PASS | semantic audit is required before manual review and ticket planning |

Result: READY
