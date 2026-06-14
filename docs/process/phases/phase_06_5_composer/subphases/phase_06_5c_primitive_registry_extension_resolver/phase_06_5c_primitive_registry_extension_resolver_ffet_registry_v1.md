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
scope: Human-readable FFET registry for 6.5C Primitive Registry, Extension Contracts, and Resolver.
title: 6.5C Composer FFET Registry v1
---


# 6.5C Composer FFET Registry v1

## Summary

Primitive Registry, Extension Contracts, and Resolver: Primitive registry, compatibility contracts, extension registration, resolver, symbolic references.

All execution flags are false. Each FFET must apply maximum concrete capability inside exact files only.

| FFET | Slug | Maximum concrete capability | MCR |
|---|---|---|---|
| `P65C-FFET-001` | `primitive_registry_contract` | Create primitive registry contracts with declared capabilities, inputs, outputs, permissions, events, cost, evidence, and failure modes. | contracts:validate proves every primitive declares required metadata. |
| `P65C-FFET-002` | `primitive_compatibility_contract` | Define primitive compatibility contracts for stage-to-stage and field-to-field composition. | Validation rejects incompatible primitive chains with explainable errors. |
| `P65C-FFET-003` | `extension_registration_flow` | Implement extension registration flow for approved primitives without tenant-created executable behavior. | Tests prove unregistered primitive proposals are rejected visibly. |
| `P65C-FFET-004` | `runtime_resolver_source_chain` | Implement resolver source layer ordering and conflict rules for tenant, template, primitive, and platform defaults. | Tests prove deterministic resolution and conflict reporting. |
| `P65C-FFET-005` | `symbolic_reference_boundary` | Enforce symbolic references for providers, credentials, users, tenants, and primitives. | Export tests prove no raw tenant IDs, user IDs, or credentials leak. |
| `P65C-FFET-006` | `primitive_registry_negative_tests` | Add falsifiable primitive-registry negative tests for missing, deprecated, incompatible, and unregistered primitives. | Demo proves each invalid primitive path is blocked before publish. |
