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
document_type: master_split_plan
scope: Master split plan for Composer Phase 6.5 subphases and FFET generation.
title: Phase 6.5 Composer Master Split Plan v1
---


# Phase 6.5 Composer Master Split Plan v1

## Summary

Phase 6.5 inserts Composer before Phase 6D through a pending suite amendment. Composer is too broad for one phase ticket, so it is split into eight subphases from 6.5A through 6.5H.

## Non-authorization

This plan does not authorize runtime implementation. All FFET execution flags remain false until human Gate 3 approval.

## Subphase split

| Subphase | Directory | Name | Scope | Source answers |
|---|---|---|---|---|
| `6.5A` | `phase_06_5a_intake_ratification_source_bridge` | Intake, Ratification, and Source-of-Truth Bridge | Import, metadata, source authority, P-ID correction, suite amendment, ratification packet. | Q6.5-001 through Q6.5-020 plus CD-1 through CD-5 |
| `6.5B` | `phase_06_5b_canonical_configuration_change_pipeline` | Canonical Configuration and Change Pipeline | Canonical configuration, composition versions, proposal object, risk classification, one change pipeline. | Q6.5-041 through Q6.5-060 plus CD-5 |
| `6.5C` | `phase_06_5c_primitive_registry_extension_resolver` | Primitive Registry, Extension Contracts, and Resolver | Primitive registry, compatibility contracts, extension registration, resolver, symbolic references. | Q6.5-061 through Q6.5-070 |
| `6.5D` | `phase_06_5d_authoring_graphs_permissions` | Authoring Model, Core Graphs, and Permission Composition | Setup wizard, organization graph, workflow graph, custom fields, permission composition, templates. | Q6.5-071 through Q6.5-080 and Q6.5-141 through Q6.5-143 |
| `6.5E` | `phase_06_5e_delegation_agreements_evidence_disputes` | Delegation, Agreements, Evidence, and Disputes | Sub-tenant delegation, structured agreements, evidence crossing, reputation protection, disputes. | Q6.5-081 through Q6.5-096 |
| `6.5F` | `phase_06_5f_money_cost_external_actions_credentials` | Money, Cost, External Actions, and Credential Boundaries | Escrow composition, split rules, refunds, cost honesty, external actions, credential boundary. | Q6.5-097 through Q6.5-120 |
| `6.5G` | `phase_06_5g_validation_runtime_recovery_export` | Validation, Simulation, Publishing, Runtime, Recovery, and Export | Validation, simulation, shadow mode, publish, runtime recovery, export/import/off-ramp. | Q6.5-121 through Q6.5-140 and Q6.5-158 through Q6.5-160 |
| `6.5H` | `phase_06_5h_frontend_figma_visual_acceptance` | Composer Frontend, Figma, Noob-Proof UX, and Visual Acceptance | Screen contracts, Figma discipline, UI surfaces, visual proof, screenshot evidence. | Q6.5-141 through Q6.5-157 |

## Execution rule

Subphases execute in dependency order. Later subphase planning may proceed while earlier approved subphases execute, but runtime/frontend implementation cannot bypass upstream contract and screen-contract dependencies.

## Human intervention rule

Autonomous work stops only for actual Gate 3 execution approval or a hard blocker.

## Final planning status

`PHASE_6_5_COMPOSER_ALL_SUBPHASE_FFETS_GATE_3_READY_FOR_HUMAN_APPROVAL`
