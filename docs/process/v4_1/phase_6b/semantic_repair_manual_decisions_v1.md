# Phase 6B Semantic Repair Manual Decisions v1

Status: PHASE_6B_SEMANTIC_REPAIR_MANUAL_DECISIONS_ACCEPTED

## Scope

- Repair Phase 6B only.
- Do not repair 6C-6F in this pass.
- PR #47 remains open as failure evidence until manual review decides otherwise.
- No ticket-pack authorization is granted.

## Manifest Flip Policy

Services, optional micro-services, provider adapters, configuration extensions, and independently activatable, billable, or versioned boundaries may be manifest_required=true when source-grounded. Evidence, logging, and internal lifecycle primitives should be manifest_required=false unless independently activatable, billable, or versioned. Ambiguous rows become manual_review_required=true.

## Manifest and Foundry Activation Consistency Policy

foundry_activation_required=true implies manifest_required=true. manifest_required=false and foundry_activation_required=true is invalid. A non-manifest primitive is also non-activatable through Foundry unless an explicit source-grounded exception is recorded. The manifest_required=true and foundry_activation_required=false case remains legal where a manifest is required for governance or traceability but not tenant activation.

## ADL Interpretation Policy

ADL-004 is represented as dependency on Phase 6A gateway/opt-out enforcement, not implemented by 6B.07 unless source explicitly says otherwise. ADL-013, ADL-014, ADL-015, ADL-016, ADL-018, and ADL-021 mappings are accepted for Phase 6B only where source-grounded. Inferred ADLs require manual_review_required.

## Manual-Review Policy

Ambiguous semantic target selection must become manual_review_required, not guessed. Source dependency to a split component must not default to first child by position.
