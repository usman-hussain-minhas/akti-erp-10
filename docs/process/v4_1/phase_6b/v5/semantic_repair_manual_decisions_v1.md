# Phase 6B v5 Semantic Repair Manual Decisions

Status: PHASE_6B_SEMANTIC_REPAIR_MANUAL_DECISIONS_ACCEPTED

Current v5 repair status: PHASE_6B_V5_READY_FOR_TARGETED_MANUAL_REVIEW_WITH_BLOCKERS

## Scope

- Phase 6B v5 only.
- v1, v2, v3, and v4 remain preserved as historical evidence.
- No Phase 6C, 6D, 6E, or 6F repair is authorized in v5.
- No ticket-pack generation, predictive stop analysis, autonomous readiness, or execution is authorized.

## Communication Surface Classification Policy

- Send-attempt surfaces may carry ADL-004 enforcement refs where source-grounded.
- Non-send setup/configuration surfaces must not carry ADL-004 enforcement refs unless source text explicitly says they enforce send attempts.
- Evidence primitives may record ADL behavior only through evidence-trace fields such as adl_evidence_refs, with non-enforcement rationale.
- Ambiguous communication surfaces become manual_review_surface and must set manual_review_required=true.

## v5 Manual Decisions

- WhatsApp outbound window, WhatsApp broadcast compliance, WhatsApp auto-reply keywords, email transactional domain, and email sequences are send_enforcement_surface.
- WhatsApp template management is non_send_setup_surface.
- Communication attempt evidence is evidence_trace_surface and records ADL-004 only via adl_evidence_refs.
- WhatsApp inbound routing, email connected inbox, and email shared inbox are manual_review_surface blockers until a human confirms whether they own outbound send enforcement.
- Pricing-family manual-review blockers from v4 remain unresolved and continue to block ticket planning.

## Final Status

PHASE_6B_V5_READY_FOR_TARGETED_MANUAL_REVIEW_WITH_BLOCKERS
