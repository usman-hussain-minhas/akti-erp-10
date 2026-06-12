---
company: HAUTM
platform: Esbla Spark
author: Usman Hussain
owner: Usman Hussain
suite_version: v5.0
file_version: v1.0
created: 2026-06-13
last_updated: 2026-06-13
status: for_ratification
document_type: operational_doctrine_appendix
scope: Esbla-named carry-forward appendix for locked Spark Platform v4 business-logic rules.
title: Esbla Spark — Business Logic v2 Appendix A: Carried-Forward v4 Rules
ratifier: Usman Hussain
---

# Esbla Spark — Business Logic v2 Appendix A: Carried-Forward v4 Rules

**Target repo path:** `docs/doctrine/current/esbla_business_logic_v2_appendix_a_carried_forward_v4_rules.md`

## A.1 Purpose

This appendix prevents active Esbla doctrine from depending on historical AKTI-era files as required reading. The historical `docs/process/core/v0_0_2/spark_platform_v4_1/0_business_logic.md` remains evidence, but Codex must consume the Esbla-named Business Logic v2 document and this appendix as the active carry-forward authority.

## A.2 Carried-forward locked rule groups

The following v4 locked rule groups carry forward unless explicitly superseded by Business Logic v2 or Blueprint v3.1:

| Rule group | Active carry-forward rule | Supersession note |
|---|---|---|
| Modular platform substrate | Capabilities are implemented as governed modules/services with manifests, contracts, validation evidence, and activation lifecycle controls. | Naming changes to HAUTM / Esbla Spark. |
| Source-grounded implementation | Codex implements from phase artifacts, exact-file plans, contracts, tests, and validation evidence; it does not invent business rules. | Current executable repo truth remains authoritative until post-6F doc-as-SOT activation. |
| Forward dependency discipline | A phase may depend only on accepted same-phase or earlier-phase truth unless a ratified amendment creates a later-phase planning dependency. | Preserved. |
| Foundry runtime authority | Foundry remains the module lifecycle/activation authority; service-manifest contract depends on Foundry bootstrap authority, never the reverse. | Preserved for the Stage 2 runtime-wiring pack. |
| Access Core and Gatekeeper | High-risk actions require Access Core and Gatekeeper enforcement; STOP_FOR_REVIEW and irreversible actions require human authority. | Preserved. |
| Evidence and audit | Evidence records, audit logs, event outbox, and named validation artifacts are required for runtime claims. | Extended by v5 reputation/evidence doctrine. |
| Saga and idempotency | Distributed workflows use Saga/outbox patterns, no 2PC, and idempotency for write APIs and compensation actions. | ADL-001 and ADL-003 continue. |
| Communication gateway | Outbound messaging routes through the communication gateway with opt-out enforcement. | ADL-004 continues and expands to v5 communication scopes. |
| Data protection | Customer-first data protection, exportability, retention disclosure, soft delete, staged deletion, legal hold, and recovery requirements continue. | Superseded where v5 adds tombstone/redaction and reputation protections. |
| Configuration system | Configuration is data-driven with canonical defaults and constrained tenant overrides; invalid combinations are blocked with explanation. | Extended by v5 configuration layering. |
| Billing and finance protections | Invoice immutability, budget caps/prepaid constraints, provider-neutral payment/payout boundaries, and evidence-bearing billing events continue. | Extended by marketplace and payout doctrine. |
| AI governance | AI behavior is governed, auditable, and bounded by data-protection and consequence-bearing action gates. | Superseded by v5 dual-plane AI doctrine where more specific. |
| Compliance packs | Compliance packs are informational workflow scaffolding with versioning, verified-as-of dates, and limitation notices. | Counsel-gated before public availability. |
| Industry configuration | Industry packs and defaults are configuration inputs, not hardcoded tenant or organization assumptions. | Preserved. |
| Optimization system | Optimization may recommend and assist, but cannot silently override locked rules, governance gates, or participant protections. | Preserved under v5 prohibited-inference doctrine. |
| ADL-013 through ADL-024 | Existing ADL rules remain active unless a v5 phase artifact supersedes them with a named ADL decision. | Missing ADL refs block promotion; no business-logic fallback. |

## A.3 Conflict rule

If this appendix conflicts with Blueprint v3.1 or Business Logic v2, the newer Esbla document wins and the conflict must be logged as a doctrine issue. If this appendix conflicts with current implemented repo truth before doc-as-SOT activation, Codex must stop and create an ADR, control amendment, migration ticket, or blocked item rather than guessing.

End of Business Logic v2 Appendix A.
