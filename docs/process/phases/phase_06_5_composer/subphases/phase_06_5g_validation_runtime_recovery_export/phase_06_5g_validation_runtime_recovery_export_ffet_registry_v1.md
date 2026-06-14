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
scope: Human-readable FFET registry for 6.5G Validation, Simulation, Publishing, Runtime, Recovery, and Export.
title: 6.5G Composer FFET Registry v1
---


# 6.5G Composer FFET Registry v1

## Summary

Validation, Simulation, Publishing, Runtime, Recovery, and Export: Validation, simulation, shadow mode, publish, runtime recovery, export/import/off-ramp.

All execution flags are false. Each FFET must apply maximum concrete capability inside exact files only.

| FFET | Slug | Maximum concrete capability | MCR |
|---|---|---|---|
| `P65G-FFET-001` | `validation_engine` | Implement validation severities Info, Warning, and Blocker with publish behavior. | Tests prove Blocker blocks and Warning requires acknowledgement evidence. |
| `P65G-FFET-002` | `simulation_test_mode` | Implement sandboxed simulation run for composition drafts with mocked external actions and no side effects. | Tests prove stage order, conditions, evidence, notifications, and escrow simulation. |
| `P65G-FFET-003` | `shadow_mode_divergence_report` | Implement shadow mode trace and divergence report for candidate versions. | Tests prove divergence above release threshold blocks cutover. |
| `P65G-FFET-004` | `publish_revalidation_and_rollback` | Implement scheduled publish revalidation and rollback/new-version behavior. | Tests prove failed revalidation keeps prior version live and notifies tenant. |
| `P65G-FFET-005` | `runtime_recovery_and_run_monitor` | Implement runtime state owner, next event, timeout, escalation, and recovery actions for active instances. | Negative tests prove dead-end runtime states are blocked. |
| `P65G-FFET-006` | `export_import_off_ramp_demo` | Implement export/import/clone/off-ramp demo with symbolic reference remap and clean-tenant validation. | Demo proves no-surprise export and import-to-draft only. |
