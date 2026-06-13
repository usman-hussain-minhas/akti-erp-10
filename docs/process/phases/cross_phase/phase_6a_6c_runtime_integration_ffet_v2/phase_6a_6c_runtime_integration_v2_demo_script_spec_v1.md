---
document_id: phase_6a_6c_runtime_integration_v2_demo_script_spec_v1
title: Phase 6A-6C Runtime Integration v2 Demo Script Specification
status: stage_2_gate_2_package_artifact
version: 1.0.0
created: 2026-06-13
updated: 2026-06-13
owner: Usman Hussain
classification: internal_controlled
source_of_truth: false
metadata_standard: esbla_file_metadata_standard_v1
---
# Phase 6A-6C Runtime Integration v2 Demo Script Specification

This specification defines the falsifiable Stage 2 demo evidence that must exist before runtime integration can close. It is not a demo execution artifact.

## Positive cases

- tenant with activated Phase 6A/6B/6C capability can access wired API surface through Foundry activation and Gatekeeper allow path
- authorized high-risk action emits audit/evidence record
- cross-tenant scheduling or workspace action preserves organization scoping

## Negative cases

- tenant without service activation cannot access disabled service APIs or frontend entry points
- Gatekeeper deny/approval/stop paths block high-risk operations
- cross-tenant access attempt fails and emits expected evidence where required
- inactive microservice frontend loading proof confirms no unauthorized runtime surface is available even if bundle structure remains static

## Required evidence

- request/response transcripts or automated demo assertions
- audit/evidence stream records
- Foundry activation state record
- Gatekeeper decision records
- tenant isolation negative proof
