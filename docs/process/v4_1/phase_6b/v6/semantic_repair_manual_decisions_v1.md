# Phase 6B Semantic Repair Manual Decisions v6

Status: PHASE_6B_V6_READY_FOR_TARGETED_MANUAL_REVIEW_WITH_BLOCKERS

Supersedes: v5/semantic_repair_manual_decisions_v1.md (for v6 only)
v1-v5 manual decisions are immutable.
ticket_pack_generation_allowed: false
execution_authorized: false

## Decision Token Format

Add exact token strings to resolve blockers.
Implementation script scans for these tokens; absent tokens keep rows as manual_review_required.

### Pricing decisions (8 required)

```
PRICING_DECISION_ACCEPTED: seed_6b_02_fixed_pricing_model → [classification]
PRICING_DECISION_ACCEPTED: seed_6b_02_tiered_pricing_model → [classification]
PRICING_DECISION_ACCEPTED: seed_6b_02_volume_pricing_model → [classification]
PRICING_DECISION_ACCEPTED: seed_6b_02_per_unit_pricing_model → [classification]
PRICING_DECISION_ACCEPTED: seed_6b_02_per_hour_pricing_model → [classification]
PRICING_DECISION_ACCEPTED: seed_6b_02_per_period_pricing_model → [classification]
PRICING_DECISION_ACCEPTED: seed_6b_02_early_bird_pricing_deadline → [classification]
PRICING_DECISION_ACCEPTED: seed_6b_02_bundle_package_composition → [classification]
```

Allowed values: configuration_extension | optional_microservice | core_microservice | tenant_service

### Communication decisions (3 required)

```
COMM_DECISION_ACCEPTED: seed_6b_07_whatsapp_inbound_routing → [surface_type]
COMM_DECISION_ACCEPTED: seed_6b_07_email_connected_inbox → [surface_type]
COMM_DECISION_ACCEPTED: seed_6b_07_email_shared_inbox → [surface_type]
```

Allowed values: send_enforcement_surface | non_send_setup_surface | inbound_only_surface

### 6B.10 API-key direction (1 required)

```
6B10_APIKEY_DECISION_ACCEPTED: [direction]
```

Allowed values: consume | publish | manual_review

## Policies Inherited from v5 (unchanged)

1. Provider-neutral payment target default = seed_6b_10_payment_allocation_balance
2. ADL-021 = anchor-only model (unified_lead_record_authority only)
3. ADL-004 = outbound send surfaces only; non_send_setup and evidence surfaces excluded
4. communication_attempt_evidence uses adl_evidence_refs not adl_refs

## v6 New Policies (in effect for v6)

5. edge_basis enum is closed; phase_doc_required is banned from final hard edges
6. target_semantic_class required on every DEM edge; closed enum defined in implementation plan
7. billing_or_evidence_required valid only when target_semantic_class in [billing_financial, audit_evidence]
8. ADL grounding: edge-carrier OR adl_self_contained_rationale (with source ref) OR manual_review_required
9. adl_self_contained_rationale structure: adl_id, source_authority_reference, rationale,
   why_no_dependency_edge_required, reviewer_note
10. scope_summary uniqueness: per-seed unique or shared_scope_rationale documented
