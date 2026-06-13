---
document_id: phase_6a_6c_runtime_integration_v2_demo_script_spec_v1
title: Phase 6A-6C Runtime Integration v2 Demo Script Specification
status: stage_2_gate_3_ready_demo_contract
version: 1.0.1
created: 2026-06-13
updated: 2026-06-13
owner: Usman Hussain
classification: internal_controlled
source_of_truth: false
metadata_standard: esbla_file_metadata_standard_v1
---
# Phase 6A-6C Runtime Integration v2 Demo Script Specification

This specification defines the falsifiable Stage 2 demo evidence that must exist before runtime integration can close. It is not a demo execution artifact.

Status: `DEMO_SPEC_COMPLETE_WITH_FIVE_NEGATIVE_ASSERTIONS_NOT_EXECUTED`

## Positive cases

- tenant with activated Phase 6A/6B/6C capability can access wired API surface through Foundry activation and Gatekeeper allow path
- authorized high-risk action emits audit/evidence record
- cross-tenant scheduling or workspace action preserves organization scoping

## Required negative assertions

- `NEG-001` / `cross_tenant_deny`: A request or UI flow from tenant A attempting to access tenant B 6A-6C data is denied and cannot return tenant B data.
  - Owning FFETs: `S2-RI-008`, `S2-RI-013`
  - Expected result: Access denied or not found without cross-tenant data leakage; tenant-isolation evidence captured where required.
- `NEG-002` / `opt_out_send_blocked`: A communication send attempt to a participant with an active opt-out is blocked before provider/send execution.
  - Owning FFETs: `S2-RI-006`, `S2-RI-007`, `S2-RI-013`
  - Expected result: Gatekeeper or communication-gateway enforcement blocks the send and emits/records the required evidence.
- `NEG-003` / `inactive_service_route_404`: A tenant without Foundry activation for a 6A-6C service receives a server-side 404 or approved unavailable response when directly requesting that inactive service route.
  - Owning FFETs: `S2-RI-005`, `S2-RI-009`, `S2-RI-012`, `S2-RI-013`
  - Expected result: Inactive service is unavailable server-side and business logic does not execute.
- `NEG-004` / `failed_kyc_t1_restricted_path`: A participant failing the required KYC or verification threshold remains at T1 or the applicable restricted tier and cannot access higher-trust actions.
  - Owning FFETs: `S2-RI-002`, `S2-RI-006`, `S2-RI-007`, `S2-RI-013`
  - Expected result: Tier/verification gate blocks higher-trust action and records the restriction basis without inventing new KYC policy.
- `NEG-005` / `failed_payment_correctable_invoice`: A failed payment produces the approved correctable invoice or billing remediation path instead of silently succeeding, double-charging, or blocking without recovery.
  - Owning FFETs: `S2-RI-003`, `S2-RI-006`, `S2-RI-007`, `S2-RI-013`
  - Expected result: Payment failure is represented as a correctable invoice/billing state with evidence; no provider behavior is invented beyond committed contracts.

## Required evidence

- request/response transcripts or automated demo assertions
- audit/evidence stream records
- Foundry activation state record
- Gatekeeper decision records
- tenant isolation negative proof
- communication opt-out enforcement proof
- inactive service route 404 or approved unavailable response proof
- failed KYC or verification-tier restriction proof
- failed payment correctable invoice or billing remediation proof

## Closure rule

S2-RI-013 may not close and Stage 2 runtime integration may not close unless all five negative assertions pass or a human-approved blocker explicitly supersedes this demo contract.
