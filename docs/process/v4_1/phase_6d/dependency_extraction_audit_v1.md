# Spark Platform v4.1 6D Dependency Extraction Audit v1

Status: SPARK_PLATFORM_V4_1_PHASE_6D_DEPENDENCY_EXTRACTION_AUDIT_READY_FOR_REVIEW

## Current Final State Summary
- Extraction edges: 277
- Distribution: {"hard_dependency":272,"deferred_with_reason":4,"conditional_dependency":1,"manual_review_required":0}
- Extraction edge distribution: hard_dependency=272 / deferred_with_reason=4 / conditional_dependency=1 / manual_review_required=0

## Summary
- Extraction edges: 277
- Distribution: {"hard_dependency":272,"deferred_with_reason":4,"conditional_dependency":1,"manual_review_required":0}
- Extraction edge distribution: hard_dependency=272 / deferred_with_reason=4 / conditional_dependency=1 / manual_review_required=0
- Hard dependencies are represented as seed dependencies.
- Optional dependencies are represented as non-hard edges.

## Checks

- PASS: no forward dependency was introduced.
- PASS: optional dependency rows have non-hard extraction representation.
- PASS: ADL refs are structured where present.

## Self-Heal Attempts

- None. Stage reached READY without self-heal.
