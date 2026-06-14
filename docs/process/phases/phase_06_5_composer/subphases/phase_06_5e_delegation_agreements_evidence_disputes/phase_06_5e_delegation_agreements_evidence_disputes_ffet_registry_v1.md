---
company: HAUTM
platform: Esbla Spark
author: Usman Hussain
owner: Usman Hussain
suite_version: v5.0
file_version: v1.0
created: 2026-06-14
last_updated: 2026-06-14
status: for_ratification
document_type: ffet_registry
scope: Human-readable FFET registry for 6.5E Delegation, Agreements, Evidence, and Disputes.
title: 6.5E Composer FFET Registry v1
---


# 6.5E Composer FFET Registry v1

## Summary

Delegation, Agreements, Evidence, and Disputes: Sub-tenant delegation, structured agreements, evidence crossing, reputation protection, disputes.

All execution flags are false. Each FFET must apply maximum concrete capability inside exact files only.

| FFET | Slug | Maximum concrete capability | MCR |
|---|---|---|---|
| `P65E-FFET-001` | `delegation_grant_contracts` | Create DelegationGrant contracts for stage, workflow, workflow-tree, and department levels. | contracts:validate proves delegation scope, host consent, states, and audit hooks. |
| `P65E-FFET-002` | `delegation_runtime_state_machine` | Implement delegation lifecycle for grant, accept, reject, revoke, tier-drop pause, abandonment, and fallback. | Tests prove P-44 abandonment timer path and safe degradation on tier drop. |
| `P65E-FFET-003` | `onward_delegation_gatekeeper` | Require explicit host consent and Gatekeeper for onward delegation. | Negative tests prove onward delegation without host consent is denied and audited. |
| `P65E-FFET-004` | `structured_agreement_acceptance` | Implement agreement draft, mutual acceptance, and binding-publish distinction. | Tests prove composing agreement is not execution and acceptance is identity-tier-gated. |
| `P65E-FFET-005` | `evidence_crossing_and_reputation_protection` | Implement evidence crossing records and reputation protection boundaries for delegation/agreement events. | Tests prove evidence lenses are authorized and prohibited reputation inference is blocked. |
| `P65E-FFET-006` | `dispute_and_review_scaffolding` | Implement dispute/review scaffolding for contested delegation, agreement, refund, and reversal paths. | Tests prove dispute path is available without inventing final legal outcomes. |
