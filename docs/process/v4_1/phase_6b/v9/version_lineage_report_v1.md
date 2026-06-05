# Phase 6B v9 Version Lineage Report

## Lineage

v1: original generated lifecycle docs; mechanically green but semantically unsafe.
v2: failed due to cross-artifact drift.
v3: parity repair but type, ADL, and report identity issues remained.
v4: ADL precision and readiness wording issue remained.
v5: edge-basis, ADL-grounding, and fidelity issue remained.
v6: local edge, TDM, and DFM propagation failure remained.
v7: graph propagation improved but TDM manual-review contradictions and pricing-anchor ambiguity remained.
v8: added machine-readable blocker registry and blocker-aware fidelity.
v9: deterministic edge-basis re-derivation for 142 mislabeled hard edges; dependency graph and 138 manual blockers preserved.

## v9 Edge-Basis Re-Derivation

Re-based hard edges: 142
Before distribution: {"activation_lifecycle_required":189,"business_logic_hard_rule":87,"billing_or_evidence_required":112,"adl_hard_rule":43}
After distribution: {"activation_lifecycle_required":84,"phase_doc_required":82,"business_logic_hard_rule":147,"billing_or_evidence_required":112,"adl_hard_rule":6}

- seed_6a_visual_workflow_builder: activation_lifecycle_required -> phase_doc_required = 38
- seed_6a_person_identity_graph: activation_lifecycle_required -> phase_doc_required = 36
- seed_6a_global_opt_out_registry: adl_hard_rule -> business_logic_hard_rule = 29
- seed_6a_access_core_gatekeeper: activation_lifecycle_required -> business_logic_hard_rule = 23
- seed_6a_api_key_scope_registry: adl_hard_rule -> business_logic_hard_rule = 8
- seed_6a_svfs_object_store: activation_lifecycle_required -> phase_doc_required = 4
- seed_6a_base_design_tokens: activation_lifecycle_required -> phase_doc_required = 4

Graph change allowed: false
Manual blocker registry remains unchanged from v8.
Recommended follow-up: harden scripts/quality/check_phase_zero_trust_mechanical_audit.mjs with these computed basis checks outside v9 scope.

## v9 Final Local Checkpoint State

Status: PHASE_6B_V9_EDGE_BASIS_REDERIVED_READY_FOR_TARGETED_MANUAL_REVIEW_WITH_BLOCKERS
Commit/push/PR: not performed pending explicit approval.
Future rule: harden the shared mechanical audit script in a separate approved follow-up; scripts are out of v9 scope.
