# AKTI ERP Phase 4B Readiness Handoff After Phase 4A v1

**Status:** READY_FOR_PHASE_4B_PLANNING
**Source phase:** Phase 4A - Local Demo / Staging Environment Stabilization
**Target phase:** Phase 4B - Frontend Operational Experience & Mission Control Shell

## Purpose

This handoff summarizes what Phase 4A makes available for Phase 4B planning. It is not a Phase 4B ticket pack, not a Phase 4B implementation plan, and not Phase 5 planning.

## Phase 4A Results Available To Phase 4B

- Repeatable local/demo startup with `scripts/dev/local-up.sh`.
- One-command shutdown with `scripts/dev/local-down.sh`.
- Guarded local database reset with `scripts/dev/local-reset-db.sh`.
- One-command local smoke with `scripts/dev/local-smoke.sh`.
- Browser inspection and screenshot capture support with `scripts/dev/local-capture-frontend.sh`.
- Local demo runbook: `docs/process/AKTI_ERP_Local_Demo_Runbook_v1.md`.
- Phase 4 current-state frontend evidence package.
- Phase 4A screenshot capture evidence.
- Final validation and no-secret evidence.

## Phase 4B Starting Assumption

Phase 4B should use the Phase 4A local/demo runtime as its inspection and validation surface.

Default local URLs:

- API: `http://127.0.0.1:3101`
- Web: `http://127.0.0.1:3003`

## Frontend Experience Inputs

Phase 4 and Phase 4A evidence indicate that the app is technically functional but not yet noob-proof or operator-ready.

Phase 4B should address:

- Mission Control / ERP shell;
- global navigation;
- module navigation;
- settings/control panel;
- module landing pages;
- setup/onboarding polish;
- Lead Desk operator-friendly pages;
- user/session context UI;
- advanced diagnostics hidden by default;
- friendly empty/error/loading states;
- responsive/readability baseline;
- browser-rendered tests;
- visual QA package.

## Required UI Principle

AKTI ERP must be noob-proof by default.

A non-technical operator should understand what to click, what is happening, and what to do next. Technical/admin details should exist, but under Advanced Options, Admin, or Diagnostics surfaces, not as the default interface.

## Accepted Phase 4A Deferral Carried Forward

Full Docker Compose API/Web/Postgres mode is explicitly deferred with P4A-011 evidence.

Phase 4B may continue using the validated hybrid local runtime unless a later approved decision creates and validates full Compose mode first.

## Phase 4B Non-Scope Reminder

Phase 4B must not silently become:

- production launch;
- production VPS/cloud deployment;
- production secrets or credential access;
- real WhatsApp production behavior;
- Foundry/module installer implementation;
- platform AI runtime;
- Phase 5;
- Phase 6;
- new business-module implementation beyond approved UI shell/readiness scope.

## Phase 5 Boundary

Phase 5 remains Foundry / Module Installer / AI-ready Module Governance.

Phase 5 should not begin until Phase 4B is planned, approved, implemented, validated, and merged, unless a later approved roadmap decision changes that order.
