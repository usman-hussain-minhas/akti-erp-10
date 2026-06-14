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
scope: Human-readable FFET registry for 6.5F Money, Cost, External Actions, and Credential Boundaries.
title: 6.5F Composer FFET Registry v1
---


# 6.5F Composer FFET Registry v1

## Summary

Money, Cost, External Actions, and Credential Boundaries: Escrow composition, split rules, refunds, cost honesty, external actions, credential boundary.

All execution flags are false. Each FFET must apply maximum concrete capability inside exact files only.

| FFET | Slug | Maximum concrete capability | MCR |
|---|---|---|---|
| `P65F-FFET-001` | `escrow_composition_contracts` | Create Composer escrow composition contracts that reference 6B escrow primitives without reinventing rails. | contracts:validate proves escrow stages are symbolic primitive compositions. |
| `P65F-FFET-002` | `split_tax_refund_reversal_rules` | Implement split, tax-line, refund, and reversal draft validation with no default split percentage. | Negative test proves 70/30 is example-only and never a default. |
| `P65F-FFET-003` | `budget_cost_honesty` | Implement cost forecast and budget warning using P-45 and existing AI/cost parameters where applicable. | Tests prove warning, acknowledgement, and block behavior are visible before publish. |
| `P65F-FFET-004` | `external_action_registration` | Implement registered-adapter external action draft model with timeout, retry, idempotency, and fallback declarations. | Tests prove missing fallback blocks publish for consequential external actions. |
| `P65F-FFET-005` | `credential_boundary` | Enforce symbolic credential references for external actions and exports. | Negative tests prove raw credentials in compositions or exports are rejected. |
| `P65F-FFET-006` | `money_external_negative_demo` | Add money and external-action demo tests for failed payment, missing credentials, provider unavailable, and AI cannot execute. | Demo proves each failure has audit evidence and user-visible recovery. |
