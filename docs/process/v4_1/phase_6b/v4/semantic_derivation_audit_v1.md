# Phase 6B v4 Semantic Derivation Audit v1

Status: READY

## Current Final State Summary

Source components: 15
Sub-surfaces: 102
Seeds: 102
Dependency edges: 451
Extraction edges: 451
Extraction edge distribution: hard_dependency=443 / deferred_with_reason=0 / conditional_dependency=0 / manual_review_required=8
Top-level seed dependency references: 443
Root seeds: 0
Current root seeds: []

## v4 Semantic Checks

manifest_required distribution: {"true":84,"false":18}
foundry_activation distribution: {"true":83,"false":19}
seed_type distribution: {"tenant_service":57,"internal_lifecycle_primitive":3,"configuration_extension":8,"core_microservice":11,"evidence_primitive":5,"audit_log_primitive":2,"optional_microservice":9,"provider_adapter":7}
seed ADL distribution: {"none":85,"ADL-015":2,"ADL-013":2,"ADL-021":1,"ADL-004":8,"ADL-014":1,"ADL-016":2,"ADL-018":1}
edge ADL distribution: {"none":443,"ADL-021":1,"ADL-004":7}
6B.07 communication channel classification before: {"tenant_service":9,"evidence_primitive":1}
6B.07 communication channel classification after: {"optional_microservice":9,"evidence_primitive":1}
Candidate optional micro-service blanket tenant_service gate: PASS
Service-manifest behavioral ADL edge gate: PASS
ADL-021 anchor-only edge precision: PASS
ADL-004 outbound gateway model: PASS

Result: READY
