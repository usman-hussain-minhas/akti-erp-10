# AKTI ERP Phase 4B Command Palette Interaction Model v1

**Status:** DECIDED_FOR_PRODUCT_DEFINITION
**Feature:** Core Phase 4B shell feature.

## Interaction Model

- Trigger: Ctrl+K / Cmd+K and visible search/command entry.
- Overlay: centered command overlay.
- Results: grouped by destination/action type.
- Keyboard: full arrow, enter, escape, and tab/focus support.
- Close behavior: escape, outside click, and explicit close button.
- Empty state: plain-English message with safe next step.
- Recent commands: show recent local commands where safe.
- Admin commands: hidden from normal users rather than disabled with technical reason.

## Basic Action Set

- open dashboard
- open Lead Desk
- create lead if route exists
- open settings
- open help

## Deferred Actions

- macros
- inline parameter commands
- cross-module backend search
- AI command generation
- module installer commands
- production integration actions

## Boundaries

The command palette navigates and opens approved Phase 4B surfaces only. It must not become Foundry, module installation, automation macro runtime, AI runtime, or cross-module search platform.
