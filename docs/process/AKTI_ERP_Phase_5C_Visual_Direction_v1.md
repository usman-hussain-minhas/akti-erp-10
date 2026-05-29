# AKTI ERP Phase 5C Visual Direction v1

Status: PHASE_5C_VISUAL_DIRECTION_READY_FOR_SCREEN_CONTRACT_MAPPING

## 1. Authority Notice

This document is a Phase 5C planning/control artifact only. It does not start Phase 5C implementation, create a ticket pack, create a ticket seed matrix, authorize frontend code changes, authorize runtime/API changes, or start Phase 6 work.

The visual references define the target visual system, layout quality, theme relationship, spacing, hierarchy, and screenshot acceptance bar. They are not authority for fake business data, unsupported modules, unsupported actions, outdated labels, hardcoded feature text, or future-phase behavior.

If image content conflicts with committed AKTI source-of-truth decisions, the source-of-truth hierarchy wins. The implementation must preserve committed decisions and explicitly document any visual/data difference instead of silently copying conflicting image text.

## 2. Visual References

Locked visual references for Phase 5C design language:

- `akti_spark_proposed_dark.png`
- `akti_spark_proposed_light.png`

Dark mode is the flagship visual direction. Light mode is the derived equivalent and should preserve the same hierarchy, density, spacing rhythm, component proportions, and interaction intent with higher light-mode contrast.

The reference images are visual targets only. Exact implementation must continue to preserve scope, source-of-truth, tenant/security, module authority, and no-fake-surface boundaries.

## 3. Pixel-Precise Interpretation

For Phase 5C, pixel-precise means matching:

- layout structure and proportions;
- spacing rhythm and content density;
- sidebar and topbar relationships;
- card shapes, borders, shadows, and glow restraint;
- visual hierarchy, text scale, and emphasis;
- dark/light theme relationship;
- contrast, hover, focus, active, disabled, and locked-state intent;
- desktop and mobile screenshot acceptance targets.

Pixel-precise does not mean permission to:

- fake data;
- activate future modules;
- implement Phase 6;
- rename technical Lead Desk surfaces;
- copy outdated labels;
- hardcode feature bullet points;
- invent unsupported actions;
- show unsupported future modules as active/openable.

## 4. Product Identity

Product shell name: `AKTI Spark`.

`AKTI ERP` remains allowed as the repository, history, and internal project name where appropriate. If a visual reference or older document shows `AKTI ERP` as UI-facing shell text, Phase 5C implementation must use `AKTI Spark`.

## 5. Layout Decision

The target shell follows the uploaded reference images and the committed Phase 5C decision memo:

- topbar spans full width;
- logo and brand lockup live in the topbar, not the sidebar;
- sidebar is navigation only;
- workspace status card sits at the sidebar bottom;
- organization badge and user avatar are separate controls;
- main canvas uses a wide hero/status banner, role-aware apps grid, and operational overview cards;
- desktop target should follow the reference images closely;
- mobile behavior is derived responsively from the same layout, because the references do not show mobile.

No layout conflict was found between the reference images and the committed decision memo. The references reinforce the locked topbar/sidebar structure.

## 6. Navigation

Primary navigation:

- Mission Control
- CRM
- Modules

System navigation:

- Settings
- Diagnostics

Diagnostics must be visually de-emphasized. Settings and Diagnostics are not apps.

## 7. CRM Rule

CRM is visible label only.

CRM maps to existing Lead Desk technical surfaces. Do not rename `lead-desk` routes, files, APIs, contracts, Prisma models, or data models. Any technical migration from Lead Desk to CRM requires a separately approved future migration phase.

## 8. Module Grid Rules

Apps = modules.

Settings is not an app. Diagnostics is not an app. Module visibility is role-aware from `GET /platform/modules`.

Module card states:

- `available`
- `requires_setup`
- `locked`
- `coming_soon`
- `hidden`

Visibility does not equal authority. Contract phrase: visibility does not equal authority. Seeing a module card does not grant import, export, delete, approve, configure, administer, backup, restore, provider activation, or destructive authority.

Cards in the visual references for Admissions, Finance, HR, and Analytics/Operations are visual examples only unless backed by real approved manifests, routes, screen contracts, and phase scope. Phase 5C implementation must not show unsupported future modules as active/openable cards.

The Modules card is a legitimate active Phase 5B1 platform surface backed by `GET /platform/modules` and the Foundry/module registry substrate. It is not a future example card. Its `visibility_state` and data source are real. The Modules card Open action is conditional on an approved frontend route for `/modules`; if `/modules` is not approved or does not exist, the card may show module availability/status but must not present a working Open Modules action.

## 9. Module Card Bullet-Point Decision

The visual references show feature bullet lists inside module cards. Current Phase 5B1 module manifest display metadata has display name, display description, icon key, category, route, visibility state, and required capabilities, but no approved source field for feature bullet lists.

Locked decision: Option A.

Add optional field in a future Phase 5C pre-UI contract ticket:

```ts
display_features?: string[]
```

Rules:

- `display_features` belongs in the module manifest display metadata layer.
- It must be validated by module manifest, Foundry, and module registry validation.
- It must be optional so existing modules can remain valid during migration/backfill if appropriate.
- It must not be hardcoded in frontend components.
- It must not be invented from chat or image text during implementation.
- It must be populated only through approved module manifest updates.
- If `display_features[]` is absent for a module, Phase 5C renders no bullet list for that module.
- Frontend must not hardcode feature bullet text for CRM, Modules, Admissions, Finance, HR, Analytics/Operations, or future modules.

Option A for display_features requires a manifest contract extension ticket before Phase 5C module card implementation tickets can be created.

This ticket is not part of the control-doc creation task. It is a Phase 5C ticket seed dependency that must appear at the head of the Phase 5C ticket seed matrix.

The dependency must add optional `display_features?: string[]` to module manifest display metadata, validate it through module manifest / Foundry / module registry validation, and backfill only approved existing module manifests.

Until `display_features[]` exists and is populated by approved manifests, Phase 5C frontend must render no feature bullet list for that module.

Frontend must not hardcode bullet text for CRM, Modules, Admissions, Finance, HR, Analytics/Operations, or future modules.

## 10. Operational Overview And CRM Pipeline Rule

A CRM pipeline status card may exist visually.

No approved CRM pipeline endpoint exists in Phase 5C. The CRM pipeline card must show a workspace-connection-required placeholder only.

Target state:

```text
Not available / Workspace connection is required.
```

Do not create a CRM pipeline endpoint. Do not show fake CRM pipeline counts, fake lead stages, fake conversion data, fake tasks, fake revenue, or fake analytics. Do not expand Lead Desk / CRM data APIs unless separately approved.

## 11. Color And Token Direction

Dark mode direction:

- near-black / charcoal background;
- cyan/teal action glow;
- purple/violet brand glow;
- emerald success accents;
- amber warning accents;
- high contrast text;
- subtle neon lines, borders, shadows, and glows.

Light mode direction:

- white / warm-slate surfaces;
- light cyan/teal active states;
- purple/violet brand highlights;
- soft shadows;
- stronger contrast than earlier light drafts;
- readable slate text;
- restrained glow treatment.

Do not lock final exact hex values in this document. Approximate tokens are implementation targets requiring visual verification against the reference images and accessibility checks.

## 12. Copy Tone

Copy should be noob-proof, operator-friendly, and non-technical by default.

Preferred copy examples:

- "Workspace not connected"
- "Connect your workspace to activate CRM and platform services"
- "Connect your workspace to load your apps"

Avoid normal-operator copy such as:

- "session missing"
- internal route names
- API jargon
- developer-only diagnostic language

Developer or diagnostic language may appear only in explicitly scoped Diagnostics surfaces.

## 13. Component Visual Principles

- premium SaaS / ERP command center;
- rounded cards with strong but clean hierarchy;
- balanced desktop app grid where data supports it;
- operational overview cards with honest unavailable/offline states;
- no fake operational metrics;
- accessible contrast;
- visible focus states;
- responsive behavior;
- screenshot acceptance required before implementation is complete.

## 14. Non-Scope

- no Phase 5C implementation;
- no Phase 5C ticket pack;
- no Phase 5C ticket seed matrix in this task;
- no Phase 6 modules;
- no fake dashboards/modules/metrics;
- no hardcoded module feature bullets;
- no white-label upload/write UI;
- no production auth/deployment/secrets;
- no CRM technical migration;
- no dynamic `GET /platform/shell/actions`;
- no marketplace, workflow builder, AI assistant, runtime AI, or real providers.
