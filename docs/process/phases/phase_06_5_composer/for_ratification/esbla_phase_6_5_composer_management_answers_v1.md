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
document_type: management_decision_answers
scope: Management answers to all 160 Phase 6.5 Composer planning questions and correction directives.
title: Esbla Composer - Phase 6.5 Management Decision Answers
---
# Esbla Composer — Phase 6.5 Management Decision Answers

**How to read this.** These are decision-complete answers to all 160 questions in the Codex Phase 6.5 question plan, plus a set of **correction directives** Codex must apply during/after import. Answers are grounded in the ratified v5.0 suite (Blueprint v3.1 incl. Appendix A, Business Logic v2, the suite manifest, and the metadata standard). Where a questionnaire premise is wrong, the answer says so. No product-version (v1/v2/v3) phasing is introduced; Composer doctrine describes the complete target, and depth-staging is a release-planning concern, not a doctrine concern.

---

## CRITICAL CORRECTION DIRECTIVES (Codex must apply these after import, before any FFET work)

**CD-1 — Parameter collision (highest priority).** The questionnaire repeatedly asks whether Composer concepts should reference **P-26, P-28, P-30, P-31**. They must **not**. In the ratified Blueprint v3.1 Appendix A, those IDs are already allocated: P-26 = backbone-change cooling period; P-27 = serious-case response window; P-28 = serious-case investigation window; P-29 = automated appeal recheck SLA; P-30 = validation-sprint pilot tenant count; P-31 = independent appeal panel window. The whole range **P-26…P-39 is occupied** (governance, due-process, validation sprint, marketplace gates, trustee). Composer parameters therefore begin at **P-40** and are *new*, added to Appendix A by the amendment described in CD-3. Any Composer doc or FFET that wires org-depth, stage-count, budget thresholds, or delegation-abandonment onto P-26/P-28/P-30/P-31 is a single-source-of-numbers violation and must be rewritten to the new P-40+ IDs. Specifically: org-graph depth → **P-40**; per-tenant active-workflow limit → **P-41**; per-workflow stage-count limit → **P-42**; composition-version retention → **P-43**; delegation-abandonment timer → **P-44**; budget-warning threshold → **P-45**. (Exact defaults are set in the amendment, not here.)

**CD-2 — Stale source references (the stale-document-authority risk, Blueprint risk row 27).** The Composer frontend-skill doc's `source_documents` cites `esbla_spark_blueprint_master_plan_v3.md` and `0_business_logic.md`. Both are superseded: the master blueprint is **v3.1** (current ratified), and `0_business_logic.md` is historical, superseded by `esbla_business_logic_v2.md`. Codex must update every Composer source reference to current v5 authorities (Blueprint v3.1, Business Logic v2) or explicitly mark a reference as historical. No Composer artifact may cite a superseded document as authority.

**CD-3 — Composer is not yet in the suite; inserting it is a doctrine change, not just an import.** The blueprint, business logic, and manifest contain **no** mention of Composer or Phase 6.5, and the execution sequence (manifest §4) runs Stage 0 → Stage 5 (6D→6F) with **no 6.5**. Importing the four Composer docs into `for_ratification` is correct, but to make Phase 6.5 real the following amendment must be drafted and ratified (it is small and mechanical): (a) Master **Blueprint v3.2 patch** — add the ninth lens commitment "complex underneath, noob-proof on top"; add a Part VI primitive-registration/Composer-substrate reference; add parameters **P-40…P-45** to Appendix A; note 6D–6F build on Composer. (b) **Business Logic v2.1 patch** — add multi-party-escrow-via-Composer to §6 and Composer hard-rule enforcement to §10. (c) **Manifest update** — insert Phase 6.5 into the phase registry and the execution sequence between Stage 2 and Stage 3, and flag 6D/6E/6F as "re-scoped pending 6.5." Until that amendment ratifies, Composer docs are `for_ratification` planning doctrine only and carry **no** implementation authority.

**CD-4 — Metadata normalization (your metadata standard).** Before import: normalize `company: Hautm` → `HAUTM` (frontend-skill doc); add missing `suite_version: v5.0` to the frontend-skill and index docs; ensure `author`, `owner`, `scope` present on all four; change `status: baseline_candidate_for_review` → `status: for_ratification`. These are the exact fixes the metadata standard and the legacy/metadata gates require.

**CD-5 — Canonical-record guarantee across all six faces.** Blueprint v3 A.4 expands "two faces" to six (settings page, canvas, wizard, AI diff, import flow, Super Admin support surface). The one-record/no-divergence guarantee must hold across all six. Codex must verify in the 6.5B plan that the **Super Admin support surface writes config only through the universal change pipeline (I-2)** — a support tool that writes config outside the pipeline would break the canonical-record guarantee and is prohibited.

---

## A. Authority, Import, and Ratification (Q6.5-001 … 010)

- **001 — `for_ratification`.** Import as for_ratification planning docs, never as runtime authority.
- **002 — Inserted before 6D, as its own phase, via the CD-3 amendment.** Not a mere parallel lane: the manifest sequence must formally place 6.5 between Stage 2 and Stage 3. Until the amendment ratifies, 6.5 planning proceeds in parallel but confers no execution authority.
- **003 — 6D blocks on *selected Composer foundations*, not all of 6.5.** 6D must wait for the Composer substrate it consumes: canonical configuration + change pipeline (6.5B), primitive registry + resolver (6.5C), and core authoring graphs (6.5D). 6D does **not** need to wait for delegation/escrow/frontend-complete (6.5E–H) before its own planning begins, but 6D execution waits until its consumed foundations are runtime-real. State this dependency explicitly in the amendment.
- **004 — All of these under different gates.** Composer is simultaneously a product surface (tenant-facing), a platform subsystem (the resolver/registry/runtime), and a composition surface for modules — each governed by its own gate. It is **not** a "module-builder" in the sense of inventing new executable behavior (see Q023).
- **005 — Planning doctrine until implementation FFETs land.** Ratifying the Composer docs makes them authoritative *doctrine*; they become *implementation* authority only through phase-specific FFET packs that pass Gate 2/Gate 3.
- **006 — Conflict order (manifest §3, restated):** law > participant contracts > Blueprint v3.1 (then v3.2 once ratified) > Business Logic v2 > phase plans (incl. Composer) > implementation. Composer loses every conflict with a higher authority; the conflict is logged, never silently interpreted.
- **007 — Ratified through the Phase 6.5 plan, with the CD-3 amendment as its doctrine hook.** No separate standalone ratification artifact for Composer; it ratifies as part of the 6.5 plan plus the master-suite amendment. One signature event.
- **008 — Becomes an actual Codex skill later, but only after the runtime contracts exist.** The frontend-skill doc is repo doctrine now; it is promoted to an operative Codex skill once the screen contracts and APIs it references are real. Until then it governs planning, not generation.
- **009 — Every source reference must be Esbla v5-current** (per CD-2). Historical AKTI files may be referenced **only** when explicitly marked historical and never as authority.
- **010 — Exclude nothing from import, but import everything as non-executing.** All four docs import; none carries FFET authorization. (The frontend app-builder plugin guidance in particular is doctrine, not a license to generate UI.)

## B. Phase Split and Delivery Strategy (Q6.5-011 … 020)

- **011 — Approved, the 6.5A–6.5H split is sound** and matches the doctrine's natural seams. One refinement: 6.5A must include the CD-3 amendment drafting (Composer-into-suite) as its first deliverable, not just doc import.
- **012 — Do not merge.** Each subphase is a genuine concern boundary; merging would recreate the wrapper-ticket risk the doctrine forbids. 6.5F (money/credentials) and 6.5E (delegation/agreements) are tempting to merge but must stay separate — money and trust-boundary changes deserve independent audit.
- **013 — Do not split further before Gate 2.** Eight is the right granularity for planning; FFET-level decomposition happens *inside* each subphase at its own catalog stage.
- **014 — Minimum 6D-start bar: 6.5B + 6.5C + 6.5D runtime-real and demo-green** (the foundations 6D consumes), per Q003.
- **015 — Phase 6.5 produces runtime capability, not just plans** — but staged by subphase per the in-phase wiring rule: each subphase ships seeds + wiring + frontend + demo extension within itself. (Distinct from the 6A–6C one-time seed/wiring separation, which was a correction, not a precedent — do not repeat it here.)
- **016 — Contracts-first, then backend, then screen-contract-led frontend.** Order within each subphase: registered contracts → resolver/runtime → screen contract → frontend implementation. The frontend-skill doc's non-negotiable rule (no screen from imagination) governs.
- **017 — Yes, Composer has its own falsifiable demo gate before 6D** (see Q158).
- **018 — Yes, feature-flagged until public activation.** Composer ships behind activation flags; public activation is gated on the external/counsel reviews that the immutable backbone requires for money/identity/delegation surfaces.
- **019 — Tenant-admin (and above) only at first**, yes — not all staff. Who *within* a tenant may use Composer is itself tenant-composed via permissions (6.5D), but the capability defaults to admin-tier roles.
- **020 — Not super-admin-only, but safety-gated.** Composer is a tenant product, not a super-admin tool; however, the money/delegation/external-action surfaces stay disabled until their backbone safety gates (Gatekeeper, escrow, identity-tier, counsel review) pass. Super Admin gets the diagnostic/support face (read-mostly, pipeline-bound writes per CD-5).

## C. Product Identity and Boundaries (Q6.5-021 … 030)

- **021 — One-line definition (adopt verbatim):** "Esbla Composer is the visual operating-model surface where a tenant composes how their organisation operates — structure, workflows, policies, external connections, agreements, costs, evidence, and relationships with other tenants — using registered platform primitives." (Blueprint v3 A.1.)
- **022 — Configure pre-approved workflow primitives, arranged and named freely.** Composer creates *compositions* of registered primitives; it does not create new executable primitive behavior (Blueprint A.5/CB-13).
- **023 — No, Composer may not create new modules or invent executable behavior.** New primitives/modules arrive through the registered extension path (ADR + contract + manifest), not through tenant composition.
- **024 — No publish without human preview for consequential change** (I-17). Low-risk, non-consequential changes may publish without the heavy preview, but anything touching money/identity/access/reputation/public-comms/customer-data/delegation/legal requires the human-readable impact preview.
- **025 — Out of scope (doctrine-level, not version-level):** inventing executable behavior from free text; AI auto-executing consequential actions; cross-tenant access outside scoped grants; selling reputation/behavioral data; any backbone override. Release-level scope cuts are decided in release planning, not here.
- **026 — All three (no-code operators, expert admins, implementation partners)** — served by progressive disclosure: plain-language default surface, advanced/diagnostic panels behind disclosure (I-20).
- **027 — Hide advanced mechanics behind diagnostics/advanced panels by default** (I-20).
- **028 — Yes, templates at launch.** The pattern/template library is core to solving cold-start; templates are themselves canonical compositions flowing through the change pipeline.
- **029 — Import supported at launch but import-to-draft only**, never import-to-live (Q138); imports validate before becoming a draft.
- **030 — Plugin/extension *installation* is gated, not a launch default.** The extension *contract model* exists from the start (so primitives register cleanly); tenant-facing third-party plugin installation is a later, separately-gated capability (Q068).

## D. Security, Identity, Access, and Safety (Q6.5-031 … 040)

- **031 — Tier 2 to access Composer authoring** (identity-verified). Browsing/read-only review may be lower; authoring touches consequential configuration.
- **032 — Tier 3 to publish changes that touch money/payout/escrow/legal**; Tier 2 to publish non-financial composition. Publishing a financial composition is a high-trust action (CB-03).
- **033 — Gatekeeper required for:** publishing consequential changes; delegating to a sub-tenant; wiring/altering an external action; releasing escrow; any change classified High/Critical (Q052–053); any AI-proposed change above Low risk.
- **034 — `STOP_FOR_REVIEW` for:** irreversible actions without a declared compensation path; backbone-touching attempts; money movement beyond declared caps; delegation onward-chaining without host consent; AI proposals that fail validation or touch prohibited data.
- **035 — Only Usman Hussain (or a future explicitly-delegated, named authority) overrides a Composer stop condition**, with a written record. This mirrors the Gate-3 human-only discipline. AI never overrides its own stop.
- **036 — Minor-safety blocks specific actions, not all access**, but a guardian-linked minor cannot author or publish consequential composition and cannot be granted prohibited surfaces (CB-08). Learning-context composition by an institution is unaffected.
- **037 — Reputation influences recommendations and warnings, not hard permission grants.** A low-reputation sub-tenant can be *warned about* and *ranked lower* in the delegation chooser; permissions themselves are tenant-composed, not reputation-gated (avoids the social-credit failure mode). Exception: the immutable backbone's safety restrictions still apply.
- **038 — Freelancers may use Composer only within scoped grants** inside a tenant's space (the workspace/delegation model), never as unbounded tenant admins.
- **039 — Sub-tenant admins may use Composer within their delegated scope** (6.5E), bounded by the host's delegation grant; they cannot exceed the host's own granted capabilities.
- **040 — Yes, delegated editing without delegated publishing is a first-class mode.** Edit rights and publish rights are independent permission verbs (Q032, permission model).

## E. Canonical Configuration and Versioning (Q6.5-041 … 050)

- **041 — Canonical unit is `Composition`, with immutable `CompositionVersion` children.** Tenant and module configuration are *resolved views*; the Composition is the authored object, the CompositionVersion is the published immutable snapshot instances pin to.
- **042 — Yes, one canonical configuration store** for all Composer-authored changes (I-1). No duplicate stores, no sync.
- **043 — Yes, every change creates a proposal object before becoming configuration** (I-2, the one change pipeline).
- **044 — No bypass — but the pipeline is *proportional*.** Low-risk changes traverse the pipeline with lightweight (often automatic) validation and no human approval; they still produce a proposal object, diff, validation result, and audit event. "No bypass" means no change skips the pipeline; it does not mean every change needs human sign-off.
- **045 — Version statuses: Draft → Test → Review → Live → Superseded/Restored** (plus Shadow as a runtime mode of a candidate version). Plain-language labels per I-9.
- **046 — Yes, drafts autosave.**
- **047 — Yes, published versions are immutable** (edits create a new draft → new version). This is what makes instance-pinning reliable.
- **048 — Rollback creates a new version that restores prior content**, rather than mutating history — auditable, and consistent with immutability (I-9, How §22.3).
- **049 — Yes, deleted configuration remains recoverable** within retention, via tombstone, preserving audit integrity (CB-17).
- **050 — Retention references the new parameter (CD-1): composition-version retention = P-43**, reference-counted (a version is retained while any instance pins it, then for the legal/audit window). Do **not** reference an existing P-ID.

## F. Change Pipeline and Risk Classes (Q6.5-051 … 060)

- **051 — Approved: Low / Medium / High / Critical.**
- **052 — Critical:** touches money movement/escrow/payout, identity-tier requirements, legal/compliance posture, cross-tenant delegation boundaries, reputation inputs, or any irreversible action without compensation.
- **053 — High:** touches permissions, external actions with side effects, public communication, customer-data exposure, or sub-tenant scope.
- **054 — Medium:** structural workflow/org changes with no money/identity/legal impact (new internal stages, renamed flows, new internal fields).
- **055 — Low:** cosmetic/labeling/display, internal notes, non-consequential field additions, draft-only edits.
- **056 — Simulation (test mode) required for Medium and above.**
- **057 — Shadow mode required for High and Critical** before cutover (I-6).
- **058 — Human approval required for High and Critical** (I-17).
- **059 — External/counsel review required for Critical changes that touch the counsel-gated categories** (money-services posture, new market legal packs, minor-safety, reputation-consequence) — consistent with Blueprint XIII.1; this gates *public activation*, not draft authoring.
- **060 — Both: deterministic baseline classification, with allowed manual escalation, never manual de-escalation below the deterministic floor.** AI may *suggest* a class but the deterministic rules set the floor (Q114).

## G. Primitive Registry and Extension Contracts (Q6.5-061 … 070)

- **061 — A Composer primitive is a registered, typed, invariant-bearing unit of platform behavior** a stage can be (Invoice, Payment, Evaluation, Approval, Notification, External Action, etc.), with a compatibility contract (I-16).
- **062 — Both: derived from existing module manifests where they exist, plus new Composer-level registration** for cross-cutting primitives (Approval, Notification). The registry references, never re-implements, module internals.
- **063 — Only the platform registers primitives** (via ADR + contract + manifest). Tenants and AI compose registered primitives; they do not register new ones (CB-13).
- **064 — Every primitive declares:** inputs, outputs, emitted events, invariants (non-removable fields/behavior), failure modes, cost dimensions, evidence policy, export shape, permission requirements, identity-tier requirements, validation hooks, and version compatibility (I-16).
- **065 — Two primitives are compatible when the producer's declared output type satisfies the consumer's declared input contract** (type-checked edges).
- **066 — Enforced at validation time AND runtime.** Composer validation blocks incompatible connections at save; the runtime independently enforces (a composition cannot claim a connection the contracts forbid) — validation-time for UX, runtime for authority (CB-03 pattern).
- **067 — No custom (tenant-authored) primitives.** Tenants compose registered primitives only.
- **068 — No third-party primitives initially; the contract model exists but third-party registration is a later, separately-gated capability** with its own security review.
- **069 — Primitive registration requires all three: ADR + contract + manifest** (decision, machine-readable contract, registry entry).
- **070 — Primitive deprecation does not break in-flight compositions** (they're pinned to versions referencing the primitive's compatible version); it blocks *new* use and triggers a migration path. Reference-counted retention (P-43) keeps the deprecated primitive available while instances need it.

## H. Organization Graph, Workflow Graph, Custom Fields (Q6.5-071 … 080)

- **071 — Arbitrary depth is the doctrine; depth is priced, not capped** — the limiter is commercial (depth tiers), not a hard ceiling. A platform safety maximum may exist to prevent abuse, expressed as a parameter.
- **072 — Org-graph depth references the NEW parameter P-40** (CD-1), not P-26. Depth-tier pricing thresholds also live under P-40's family.
- **073 — Composer creates organisation units** (branches/departments/teams) as tenant composition — this is configuration of the tenant's own structure, not invention of executable behavior. It may also map to existing units where they exist.
- **074 — Yes, Composer creates workflow stages** (typed by registered primitives, tenant-named).
- **075 — Stage-count limit references the NEW parameter P-42** (CD-1), not P-28.
- **076 — Yes, Composer creates custom fields** with primitive inheritance (Blueprint D.4).
- **077 — A custom field declares a parent primitive and inherits its typed semantics** (evidence-writable, appeals-bound where applicable, exportable, reportable); it cannot remove or weaken the primitive's invariant fields (CB-12).
- **078 — Custom fields may *inform* permission policies (as data scopes) but cannot themselves grant permissions** — permission grants are authored in the permission model, not implied by a field.
- **079 — Custom fields may feed billing/reputation/identity ONLY through their parent primitive's governed path**, never by inventing a new consequential effect. A field parented to Invoice can carry a billable value (through Invoice's governed billing); a field cannot mint reputation or alter identity tier outside the backbone.
- **080 — Unsafe custom fields are blocked by:** invariant-conflict checks, type validation, circular-reference detection on calculated fields, and the backbone check (a field cannot create a prohibited inference, demographic enforcement, or identity/reputation effect).

## I. Permissions, Delegation, Sub-Tenants (Q6.5-081 … 090)

- **081 — Delegation is a *composition* (I-8), bound by an *agreement*, scoped by a *capability grant*.** It is explicitly **not** a broad permission grant into the host tenant. (The questionnaire's framing options are reconciled: composition is the primary nature; agreement and grant are its bindings.)
- **082 — Approved delegation levels: stage, workflow, workflow-tree, and department.**
- **083 — Onward delegation only with the host's declared consent**, bounded, every hop audited, responsibility chain visible to the host (Blueprint C.6).
- **084 — On delegate tier-drop: notify both parties, pause stages requiring the lost tier, apply the configured fallback** (Blueprint C.6 / How §13.5). The engagement degrades safely, never continues invalid.
- **085 — On abandonment: the abandonment timer fires, the stage routes to its declared fallback** (another sub-tenant, internal replacement, or hold-and-notify), and evidence is written.
- **086 — Delegation-abandonment timer references the NEW parameter P-44** (CD-1), not P-31.
- **087 — A sub-tenant may publish only within its delegated scope and only if granted publish rights** (edit-without-publish is the default; publish is an explicit additional grant).
- **088 — A sub-tenant may invite external users only if the host's grant explicitly permits it**, bounded and audited; default is no.
- **089 — Audit evidence required for:** every delegation grant, acceptance, rejection, onward-delegation, tier-drop pause, abandonment, fallback, and revocation.
- **090 — Gatekeeper required for:** creating/altering a delegation, onward-delegation, and any delegation touching money/escrow.

## J. Agreements, Escrow, Payments, Cost (Q6.5-091 … 100)

- **091 — Yes, Composer structured agreements can become binding operational agreements** — but only through the agreement's own acceptance flow (mutual acceptance, identity-tier-gated, audited). Composing an agreement ≠ executing it; the parties accept it.
- **092 — Composer generates drafts and, on mutual acceptance, publishes binding agreements** — draft authoring and binding execution are distinct, human-gated steps.
- **093 — The 70/30 split is ONLY an example, never a governed default.** No split percentage is doctrine; splits are tenant/agreement-authored and validated for reconciliation. Codex must not treat 70/30 as a default anywhere.
- **094 — Yes, split rules support tax lines** as separate explicit lines (not buried in percentages).
- **095 — Yes, split rules support refunds** with declared reversal terms.
- **096 — Yes, reversal-after-payout is supported** per agreement terms, through the dispute/appeals path where contested.
- **097 — Escrow is in scope for Phase 6.5 implementation** (it's core to the ecosystem loop), built on 6B's escrow primitives — Composer composes them, does not reinvent them. Subphase 6.5F.
- **098 — Payout rails are *referenced*, not *built*, in 6.5.** 6.5 uses 6B's existing provider-neutral payout adapters; no new rails are created in Composer. The per-market rail capability matrix remains counsel/vendor-gated per Blueprint VIII.
- **099 — Failed-payment correction paths required for:** every Payment, Escrow-release, Refund, and split-execution stage. A payment failure yields a correctable state and routes to the workflow's declared failure path (never a silent stall).
- **100 — Budget-warning threshold references the NEW parameter P-45** (CD-1), not P-30.

## K. External Actions and Credentials (Q6.5-101 … 110)

- **101 — An external action is a registered-adapter invocation of a third-party service** (video, AI, payment, messaging, webhook) expressed as a stage with declared timeout/retry/idempotency/fallback (Blueprint D.9).
- **102 — Real external provider calls are allowed in 6.5 implementation, but gated:** test mode uses sandboxes/mocks; production calls require the credential boundary (I-15), Gatekeeper for consequential ones, and the failure-handling declarations. Escrow/payment external calls additionally require the money gates.
- **103 — Provider credentials are tenant-owned (or sub-tenant-owned for delegated stages), stored in the platform secret-management layer, referenced symbolically** (I-15). Platform-owned credentials exist only for platform-operated services.
- **104 — Yes, AI may propose external actions** (as composition proposals on the canvas).
- **105 — No, AI may not execute external actions.** AI proposes; humans accept; primitive/adapter services execute (A.7, I-17).
- **106 — Human preview required for external actions that move money, send public communication, or are irreversible.**
- **107 — Gatekeeper required for external actions with consequential side effects** (payment, messaging at scale, data egress).
- **108 — Missing credentials: the stage cannot publish-to-live (validation blocks with a plain-language "connect provider X" prompt); at runtime a missing credential routes to the declared failure path, never a silent hang** (How §18).
- **109 — Provider capability unavailable: apply the stage's declared timeout/retry/fallback; degrade gracefully per platform-independence doctrine** (Blueprint E, CB pattern).
- **110 — Both: external-action failure creates audit evidence AND user-visible recovery** (I-5, I-12).

## L. AI Assistance and Data Classification (Q6.5-111 … 120)

- **111 — AI may assist with:** drafting compositions from plain language, proposing changes, explaining validation failures, suggesting cheaper/safer alternatives, generating template variants, summarizing operational issues, and helping map imports (A.7).
- **112 — AI may never:** invent primitives, write substrate code, bypass capability contracts, silently apply changes, approve its own high-risk action, bypass Access Core/Gatekeeper/audit/cost/identity/compliance/human-approval, or hide reasoning/provenance/cost (A.7).
- **113 — Yes, AI may generate a complete change proposal** — which still enters the change pipeline and requires human acceptance for any non-Low risk.
- **114 — AI may *suggest* a risk class but not *set* it below the deterministic floor** (Q060). Deterministic rules set the floor; AI/human may escalate.
- **115 — Yes, AI may recommend publish timing** (advisory only).
- **116 — AI may inspect customer data for suggestions ONLY within the data-classification boundary and with consent where required** — never prohibited classes (Q118), never cross-tenant data without an explicit grant, and BYO-API data-boundary rules (6A-X7) apply.
- **117 — AI-readable classes:** tenant's own non-sensitive operational/configuration data the acting user is authorized to see.
- **118 — AI-prohibited classes:** other tenants' data, platform credentials/secrets, identity-verification artifacts, anything a tenant marks restricted, and any class whose processing would enable a prohibited inference (CB-10).
- **119 — Yes, AI usage is metered and budget-enforced through the existing AI-plane parameters** (P-08 freemium per Person, P-09 org pool, P-10 cost ceiling, P-11 notice). No new AI-credit parameter is needed; Composer's AI assistance consumes the platform AI plane.
- **120 — AI provenance recorded:** model + version, prompt + category, generation settings, data used, and the exact human modifications before acceptance (A.7 / How §9.4) — stored as evidence, exportable, auditable.

## M. Validation, Simulation, Shadow Mode, Publish (Q6.5-121 … 130)

- **121 — Validation severities: Info / Warning / Blocker.**
- **122 — Blocker blocks publish.**
- **123 — Warning allows publish with explicit acknowledgement** (and is recorded).
- **124 — Simulation (test mode) must prove:** the composition runs end-to-end on sandboxed/mocked externals, stages fire in the intended order, conditions resolve deterministically, evidence/notifications/escrow behave, with no real side effects (How §21).
- **125 — Shadow mode must prove:** a candidate version, fed mirrored live triggers, produces a trace whose divergence from live is within the accepted threshold, with zero real side effects (I-6).
- **126 — Divergence beyond the declared threshold blocks cutover** (the threshold is a release-scoped acceptance criterion, surfaced in the divergence report; it is not a doctrine constant).
- **127 — Yes, scheduled publish revalidates at execution time** (How §20.4).
- **128 — If revalidation fails at the scheduled moment, the publish does not occur, the prior version stays live, and the tenant is notified with the failure reason** (no silent partial publish).
- **129 — No publish during unresolved conflicts** (conflict detection blocks; the editor resolves first).
- **130 — No publish-to-live while runtime dependencies are unavailable** — authoring is allowed, but publish surfaces a Blocker (or, for non-consequential changes, a Warning) per I-5/§20.

## N. Runtime, Recovery, Evidence, Export (Q6.5-131 … 140)

- **131 — Minimum runtime behavior:** instances pin to a composition version; stages fire via the resolver; every active instance has a known state, owner, next event, timeout, escalation, and recovery (I-18); evidence is written for consequential steps. (Execution-model depth — sequential-with-branching vs full parallel engine — is a release-staging decision named in the release plan, not a doctrine cut here.)
- **132 — A dead-end runtime state is any active instance lacking a known current state, owner, next expected event, timeout, escalation path, or recovery action.** These are prohibited (I-18).
- **133 — Recovery actions for stuck states:** retry, pause, fallback, provider-switch within declared limits, queue, notify, escalate — all bounded by declared recovery policies (I-10); never unbounded auto-mutation.
- **134 — Audit evidence required for every consequential runtime event:** stage transitions, money state changes, evidence crossings, delegations, external-action results, escalations, AI-accepted proposals (CB-05).
- **135 — Every denied action emits audit evidence** (permission denial, Gatekeeper stop, validation block, cost-cap stop) — with the explainable-decision payload (I-13).
- **136 — Yes, evidence multiplexing: one recorded event, many authorized lenses** (audit, billing, debugging, support, reputation, analytics, export) — written once, never parallel stores (I-12).
- **137 — No-surprise export must include:** the composition structure, versions, custom-field definitions, permission policies, and symbolic references — and must re-import into a clean tenant with no hard-coded tenant/user/credential IDs and no silent references (I-11, I-15).
- **138 — No, imported compositions cannot publish immediately** — import creates a draft that must validate and have its references remapped before publish (Q029).
- **139 — Import validation:** schema validity, version compatibility, presence of required primitives/providers, and reference-remap completeness — reported as plain-language prerequisites, never a broken draft (How §27.3).
- **140 — Off-ramp guarantee at launch:** no content/config/composition is hostage; export is never withheld for unpaid invoices; certified templates and high-risk compositions prove clean-room export→import→validate→golden-path (I-11, CB-06/CB-17).

## O. Frontend, Figma, Visual Acceptance (Q6.5-141 … 150)

- **141 — Approved v1 screen-contract set:** Setup Wizard, Organisation View, Workflow View, Policy/Permission View, Delegation View, Agreement/Split View, External Connections View, AI Proposal Panel, Test/Shadow/Debug/Replay View, Publish View, Run Monitor, Export/Import View (the frontend-skill doc's enumerated surfaces). Exact release ordering is a release-planning decision.
- **142 — Yes, Setup Wizard is the first frontend surface** (it's the cold-start path and the noob-proof proof point).
- **143 — Organisation and Workflow Views are canvas-first WITH a form/list fallback** (canvas-plus-form parity, Blueprint C.4 / acceptance point 3). Neither is canvas-only.
- **144 — Mobile Composer is read-only review + monitoring at launch** (Run Monitor, approvals); authoring/editing is desktop/tablet-first. Native mobile authoring is deferred to the PWA/Phase-8 boundary.
- **145 — Approved Figma source: only a tenant-approved, node-specific Figma file referenced by node URL** (frontend-skill §4.2). No Figma file is authority; it is design context.
- **146 — Figma maps existing design-system components; it does not introduce new components into code** without those components being added to the design system through the proper path (frontend-skill §4.1 / §12).
- **147 — No, frontend app-builder output cannot be committed directly.** It enters the one change pipeline (I-2), must satisfy the screen contract, screen-state matrix, and architectural-strength mapping, and passes review before commit (frontend-skill §5/§8).
- **148 — Mandatory visual states for every screen:** empty, loading, populated, error, recovery, permission-denied, and (where applicable) shadow/test/debug (frontend-skill §10 screen-state matrix).
- **149 — Browser screenshot evidence required for any FFET that touches a Composer UI surface before closure** (visual proof; frontend-skill §14 / Q157).
- **150 — Visual DoD for "noob-proof":** a non-technical operator completes the screen's core task from a template within the release-defined session length without docs; invalid actions show plain-language repair; no implementation jargon on the default surface; consequences previewed before publish; cost/risk/missing-requirements visible before runtime (A.6 / I-20).

## P. FFET and Autonomous Execution Readiness (Q6.5-151 … 160)

- **151 — One FFET registry per subphase** (6.5A…6.5H each own theirs), with a Phase-6.5 master index referencing all eight. Per-subphase registries match the per-phase discipline already in use.
- **152 — Execute only after the relevant subphase Gate-2 plan is complete AND its upstream dependencies have executed** — not "all eight planned first," but respecting the 6.5A→6.5H dependency order.
- **153 — Independent subphases may execute while later subphases plan, within the dependency order** (e.g., 6.5B can execute while 6.5E plans; 6.5H frontend implementation waits for its backend contracts per the questionnaire's own exception).
- **154 — Docs-only Composer FFET ladder:** JSON/metadata audit + custom Composer audit + legacy/stale-term scan + lower-snake path check + `git diff --check` + link check. (No runtime suite for docs-only.)
- **155 — Contract/runtime Composer FFET ladder:** the docs ladder PLUS `contracts:validate`, api/web typecheck, api/web test, `prisma validate` (read-only unless a separate schema control pack authorizes change), `registry:check`, and the relevant negative tests.
- **156 — Frontend Composer FFET ladder:** the runtime ladder PLUS screen-contract conformance, screen-state-matrix coverage, accessibility checks, and browser screenshot evidence (Q149/Q157).
- **157 — Yes, every Composer FFET touching UI includes visual proof** before closure.
- **158 — Yes, Composer has a final falsifiable demo script before Phase 6D starts.** Golden path: compose an org graph (HQ + branches + departments) → add a workflow with mixed native+external stages → author inline + standalone permission policies → assign a sub-tenant to a stage → wire an external checkout → request an AI proposal and accept-with-modification → save → test-mode run → shadow run with divergence report → publish with human preview → live run firing primitives in order → escrow hold → sub-tenant completes → escrow split → both invoiced → evidence visible in Run Monitor/audit/billing → export composition → re-import into a clean tenant and run golden path. Negative tests (must all pass): cross-tenant isolation breach denied; opt-out recipient notification blocked; inactive workflow route 404 server-side; failed-KYC stage routes correctly; failed-payment yields correctable state; permission policy attempting a backbone override rejected; AI proposal referencing an unregistered primitive rejected visibly; export containing a raw credential rejected (credential-boundary test); dead-end-runtime attempt (a stage with an unhandled outcome) blocked at publish.
- **159 — Composer-unique hard stop conditions:** any attempt to (a) write config outside the one change pipeline; (b) reference a superseded doc as authority; (c) wire a Composer concept onto an occupied non-Composer P-ID (the CD-1 collision); (d) place a raw secret in a composition/export; (e) invent an executable primitive from free text; (f) publish a consequential change without human preview; (g) grant cross-tenant access outside a scoped capability grant; (h) let AI execute (not propose) a consequential action. Hitting any of these halts the run and escalates to Usman Hussain.
- **160 — Final status string: `PHASE_6_5_COMPOSER_GATE_2_READY_FOR_HUMAN_APPROVAL`** for the planning milestone; and for the eventual completion milestone, `PHASE_6_5_COMPOSER_COMPLETE__COMPOSER_DEMO_GREEN__READY_FOR_PHASE_6D`. No Gate-3 execution authority is implied by either string.

---

## Answers to the questionnaire's embedded assumptions

- **"Phase 6.5 before 6D"** — confirmed, via the CD-3 amendment; the manifest sequence must be edited, not just assumed.
- **"Composer docs are candidate, not authority"** — confirmed; for_ratification, no implementation authority until FFET packs pass Gate 2/3.
- **"No runtime/schema/package/lockfile/generated/frontend/AGENTS changes during import/split"** — confirmed; the import + split + questionnaire PRs are docs/control only, all execution flags false.
- **The three recommended PRs are approved** with one addition: the first PR (import) must also apply CD-2 and CD-4 (stale-reference and metadata fixes) as part of the metadata normalization step, and the second PR (split + questionnaire) must carry CD-1 and CD-3 as explicit blocking notes so no FFET generation wires onto occupied P-IDs or treats Composer as suite-resident before the amendment ratifies.

---

## The one thing only the human decides

Codex stops at `PHASE_6_5_COMPOSER_GATE_2_READY_FOR_HUMAN_APPROVAL` with all execution flags false. The CD-3 amendment (Composer into the master suite, new parameters P-40…P-45) is itself a doctrine change requiring a ratification record signed by Usman Hussain — the same signature discipline as the v5.0 suite. Importing and splitting may proceed now; ratifying Composer into the spine, and approving any Composer execution wave, remains the human gate.

End of Phase 6.5 management decision answers.
