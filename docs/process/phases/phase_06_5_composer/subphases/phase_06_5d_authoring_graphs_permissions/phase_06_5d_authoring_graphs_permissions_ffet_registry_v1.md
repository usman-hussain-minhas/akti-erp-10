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
scope: Human-readable FFET registry for 6.5D Authoring Model, Core Graphs, and Permission Composition.
title: 6.5D Composer FFET Registry v1
---


# 6.5D Composer FFET Registry v1

## Summary

Authoring Model, Core Graphs, and Permission Composition: Setup wizard, organization graph, workflow graph, custom fields, permission composition, templates.

All execution flags are false. Each FFET must apply maximum concrete capability inside exact files only.

| FFET | Slug | Maximum concrete capability | MCR |
|---|---|---|---|
| `P65D-FFET-001` | `setup_wizard_screen_contract` | Create Setup Wizard screen contract and API contract for cold-start composition authoring. | Screen contract defines route, users, capability, states, actions, and must-not-happen rules. |
| `P65D-FFET-002` | `organisation_graph_authoring` | Implement organization graph draft authoring with P-40 depth enforcement and no hardcoded org assumptions. | Tests prove depth limit, multi-parent precedence, and reorganization validation. |
| `P65D-FFET-003` | `workflow_graph_authoring` | Implement workflow graph draft authoring with P-41 and P-42 limits and bounded-loop validation. | Tests prove active workflow and stage-count enforcement. |
| `P65D-FFET-004` | `custom_fields_with_primitive_inheritance` | Implement custom field definitions inherited from approved primitive field types. | Negative tests block custom fields that affect money, identity, reputation, or permission without explicit primitive support. |
| `P65D-FFET-005` | `permission_composition_authoring` | Implement permission composition draft model with Access Core and Gatekeeper implications explicit. | Tests prove permission changes during in-flight work follow declared behavior. |
| `P65D-FFET-006` | `template_library_and_concurrent_editing` | Implement template-to-draft and concurrent editing conflict evidence for core authoring flows. | Tests prove templates enter pipeline as proposals and conflicts block publish. |
