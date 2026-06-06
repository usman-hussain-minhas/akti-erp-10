# Phase 6B v4 Semantic Repair Manual Decisions v1

Status: PHASE_6B_V4_SEMANTIC_REPAIR_MANUAL_DECISIONS_ACCEPTED

## Current Version

This file is the current v4 manual decision artifact. v1, v2, and v3 are historical failure evidence only.

## Decisions Preserved

- Phase 6B only. No 6C-6F repair is authorized by v4.
- No ticket-pack planning, predictive stop analysis, autonomous readiness, execution prompt, or ticket execution is authorized.
- ADL-021 remains anchor-only on seed_6b_04_unified_lead_record_authority.
- ADL-004 remains represented as dependency on finalized Phase 6A outbound gateway enforcement for outbound communication seeds.

## v4 Decisions

- 6B.07 WhatsApp and email channel capability surfaces are classified as optional_microservice when independently channel-scoped, toggleable, configurable, or billable.
- Behavioral ADLs must not appear on generic service_manifest_contract edges unless the manifest edge itself enforces that ADL with explicit source-grounded rationale. v4 has no behavioral ADLs on service_manifest_contract edges.
