---
company: HAUTM
platform: Esbla Spark
author: Usman Hussain
owner: Usman Hussain
suite_version: v5.0
file_version: v2.0
created: 2026-06-13
last_updated: 2026-06-13
status: for_ratification
document_type: phase_plan
scope: Full Phase 6E (Growth Surface) plan — campaigns, e-commerce, and builder core, with runtime wiring inside the phase.
title: Esbla Spark — Phase 6E: Growth Surface — v2
ratifier: Usman Hussain
---

# Esbla Spark — Phase 6E: Growth Surface — v2

**Target repo path:** `docs/process/phases/phase_06e_growth_surface/plan/esbla_phase_6e_growth_surface_v2.md`
**Supersedes:** the v4.1 `6e_growth_surface.md` phase document (historical) and `phase_6e_amendments_v1.md` (in full). Self-contained for Codex alongside Blueprint v3.1 and Business Logic v2.
**Catalog rule:** the v4.1 component catalog 6E.01–6E.09 is adopted unchanged as baseline scope and condensed in §4; this plan wins where it extends or modifies. Forward-dependency re-verified at catalog stage.

## §1 Phase objective

Deliver the growth surface: audience and consent infrastructure, internal outbound campaigns, ad attribution, automation, e-commerce, and the website/app builder core — the substrate the Phase 7 handoff wedge productizes. Campaign scope is **locked to Scope A + Scope B**: cross-platform attribution/coordination via provider APIs (ads stay native on their platforms) plus internal outbound (email/WhatsApp/SMS/push) to the operator's own CRM. **No Scope C** (AI-generated ads pushed to platforms) and Marketplace / Trust Layer is Phase 9; Scope C remains locked; reconsideration only through a Blueprint XIII.3 gate.

## §2 Entry dependencies

6A–6C closed with amendment + wiring; 6D closed per its plan. Consumes: gateway with ADL-004 opt-out (6A-X5), evidence ledger (6A-X3), AI dual-plane governance (6A-X7), Foundry grants/pruning (6A-X8), billing/escrow/payout adapters (6B, 6B-X1/X2), workspaces and structured agreements (6C-X1/X2), student/event sources for audiences (6D where active).

## §3 In-phase delivery rule (binding)

Identical to 6D §3: every 6E component ships seeds **and** runtime wiring (full enforcement spine, RLS) **and** activation-pruned frontend **and** a demo-script extension, inside the phase. **Phase exit = the 6E golden-path E2E green in CI**: build site in a workspace → publish with platform identity → capture a form lead with consent → audience segment respects a suppression → send a campaign that skips an opted-out recipient → storefront order placed → Saga fulfilment → attribution recorded → analytics report generated — plus §7 negative tests.

## §4 Component catalog (baseline carried + v2 ecosystem extensions)

| ID | Component (baseline carried) | v2 ecosystem extension |
|----|------------------------------|------------------------|
| 6E.01 | Campaign Audience and Suppression | Suppression is **derived from** the global opt-out registry (ADL-004) plus tenant lists; consent references stored as evidence; segments never include guardian-linked minors for commercial campaigns |
| 6E.02 | Email/WhatsApp/SMS/Push Campaigns | Scope B implementation; provider-neutral channel adapters with fallback doctrine; sender/number reputation management operational item; every send gateway-mediated and billable-evidence backed |
| 6E.03 | Meta Ads and Attribution | Generalizes to **Scope A adapters** (Meta first; Google/TikTok as later adapters in the hardening track); ads remain native; attribution chains are evidence records; provider failure degrades to manual attribution |
| 6E.04 | Automation Sequences and Campaign Analytics | Consequence-bearing automated sends pass Gatekeeper where configured; A/B and ROI reporting is evidence-first; no engagement-bait dark patterns (lens) |
| 6E.05 | E-Commerce Storefront and Product Discovery | Reviews on storefronts follow evidence-first doctrine (verified-purchase structure, no opinion-score reputation crossover into participant reputation) |
| 6E.06 | Cart, Checkout, Orders, Fulfilment, Returns | Saga-based order flow carried; payment failures yield correctable invoice states; refunds wired through 6B escrow/refund primitives |
| 6E.07 | Marketplace and E-Commerce Analytics | Vendor onboarding uses T2/T3 tiers; payouts via the verification-pending rail matrix; commission/payout disputes route into the 6C-X5 ladder |
| 6E.08 | Website and App Builder Core | Sites live in **workspaces** (6C-X1): build mode for the professional, **locked edit mode** for client handoff; transfer = permission change with snapshot per manifest; **published surfaces carry mandatory Esbla Spark platform identity**, with the **agency-branded client editor** as the configurable surface |
| 6E.09 | Forms, SEO, Blog, Multi-Site, PWA, Connected Blocks | Form leads capture consent state at source; connected blocks respect activation (a store block on a tenant without commerce active fails gracefully); PWA settings bounded to Phase 8's later scope |

## §5 Ecosystem doctrine bindings

1. **Builder off-ramp (export honesty).** Site export to standard static assets is a 6E.08 deliverable, not deferred to Phase 7: full-fidelity static content; forms export definitions + webhook configuration; dynamic platform services (checkout, auth, LMS blocks) export data + content + structure with a generated **capability map** of what requires re-implementation elsewhere. Export package includes assets, DNS guidance, deployment instructions, environment-variable documentation. Export is never withheld for unpaid invoices.
2. **Domain three-state handling.** Every site is in exactly one of: platform subdomain, connected custom domain (verified, platform-served), or exported (platform serves nothing; record retained as evidence). State transitions are audited; DNS guidance generated per state.
3. **Handoff as wedge substrate.** 6E.08/6E.09 must expose the primitives the Phase 7 wedge productizes: locked-section client review, milestone acceptance hooks (6C-X2 agreements), publish/transfer events, subscription billing hooks (6B). Phase 7 adds packaging, not new substrate.
4. **Consent and minors.** Commercial outbound never targets guardian-linked profiles; suppression wins every conflict; a recipient-level opt-out blocks all tenants' sends to that channel identity (global, per ADL-004).
5. **Neutrality in copy.** Builder templates, storefront defaults, and campaign template language follow the Part XIV language standard (no guaranteed-outcome copy in shipped templates).

## §6 Explicit non-scope

Scope C ad creation; marketplace matching/escrow disputes at scale (Phase 9 gates); native mobile apps (PWA boundary per Phase 8); new payment/payout rails beyond 6B adapters; cross-tenant audience sharing or sale (prohibited — reputation/behavioral data is never a commercial data product).

## §7 Gates and definition of done

Standard pipeline with the 12 planning gates and zero-trust Gate-2 audits; **Gate-3 human approval** before the run; wiring and frontend in-phase per §3. Exit negative tests: opted-out recipient provably skipped with evidence record; campaign to a suppressed segment member blocked at gateway; guardian-linked profile excluded from a commercial audience build; site export of a commerce-enabled site produces the capability map and parses; an inactive store block's route 404s server-side; cross-tenant audience isolation attempt fails. Exit also requires: audit headers match live JSON counts; failure-pattern library updated; demo-script extension merged and green nightly.

**Parameters referenced:** P-08, P-09, P-11 (notice on freemium-affecting changes surfaced in tenant UI), P-13 (high-value order confirmation patterns), P-16 (acceptance ladder on handoff milestones), P-18, P-21 (instrumentation only — gate evaluation is Phase 9), P-22/P-23 (R-stage measurement hooks).

End of Phase 6E plan v2.
