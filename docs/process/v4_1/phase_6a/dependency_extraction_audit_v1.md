# Spark Platform v4.1 Phase 6A Dependency Extraction Audit v1

Status: SPARK_PLATFORM_V4_1_PHASE_6A_DEPENDENCY_EXTRACTION_AUDIT_READY_FOR_REVIEW

## Summary

- Dependency edges: 94
- Distribution: {"hard_dependency":93,"manual_review_required":1}
- ADL-004 represented.
- ADL-016 deferred_to_phase_6b_gl.
- Consumes/emits hard-dependency discipline enforced.
- service_manifest_contract is the default manifest target for activatable/configurable service-like surfaces.

## Checks

- PASS: all required_dependencies_raw represented or deliberately transformed with rationale
- PASS: optional dependencies remain soft/conditional unless upgraded with basis
- PASS: every hard_dependency has hard_dependency_basis
- PASS: no consumes/emits-only hard dependency
- PASS: no broad label replaces concrete dependencies
- PASS: no edge lacks source-grounded reason
- PASS: no forward dependency
- PASS: ADL-004 represented
- PASS: ADL-016 deferred/not Phase 6A scope

## Self-Heal Attempts

- None. Stage reached READY without self-heal.

## Review Patch - structured ADL edge references

- structured ADL references are now present on dependency edges where the edge reason or basis already mentioned an ADL.
- Reason prose is retained but no longer the only ADL traceability mechanism.
- No new ADL dependency edge was invented solely to add ADL coverage.
- ADL-002 was handled only where it was already present in an edge reason or basis; otherwise it was left unmodified.
