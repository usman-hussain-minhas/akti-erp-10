# Phase 6E — Growth Surface

**Status:** `V4_PHASE_6E_GROWTH_SURFACE_SPEC`  
**Document type:** v4 phase specification for sub-surface cataloguing and dependency-aware ticket generation.  
**Non-scope:** No code file paths, endpoint paths, validation commands, implementation instructions, or repo-specific operations.

> **Authority rule:** Business logic authority = `0_Business_Logic.md`; phase documents MUST conform to it. Where a phase document and the business logic document conflict, `0_Business_Logic.md` wins. Service boundaries proposed here are subject to sub-surface validation; dependency ordering and business logic are locked.

> **Dependency rule:** Anything in phase N+1 MUST NOT be developed before phase N. Within a phase, a component may depend only on earlier phases or earlier-numbered components in the same phase. If a feature needs a later dependency, the dependency must be moved earlier, the feature must be split, or the dependent part must be deferred.

## 1. Phase Objective

Phase 6E builds outward-facing growth and revenue surfaces after core, commerce, operations, and learning exist: Campaigns, E-Commerce, and Website/App Builder. It deliberately excludes AI Business Consultant, advanced onboarding/admin, and advanced design polish, which move to 6F.

## 2. Entry Dependencies

Phase 6A, 6B, 6C, and 6D complete. Within 6E, Campaign audience/sends precede campaign analytics; E-Commerce follows Products/Finance/Inventory; Website Builder follows base design system and earlier data sources. 6F is not a dependency.

## 3. Explicit Non-Scope

- AI Business Consultant and proactive AI intelligence.
- Advanced onboarding/support/admin workflows.
- Advanced design polish beyond what is required to use base design components.
- Any hard dependency on 6F.
- White-label removal of required platform identity.

## 4. Boundary Status

LOCKED: Business logic and dependency ordering in this phase are locked.

PROPOSED: Exact service and micro-service boundaries in this document are candidate boundaries. Sub-surface cataloguing validates, splits, merges, or promotes them before ticket generation.

## 5. Phase-Level Business Logic Applied

- Modules are labels; candidate services are architecture units.
- Every service/micro-service boundary must respect the one-way dependency arrow: service → core.
- Foundry is activation authority for tenant-toggleable services and optional micro-services.
- Every micro-service emits evidence, including zero-priced capabilities.
- Pricing attaches at the leaf and rolls up.
- No component may depend on a later-numbered component in this phase or on a later phase.
- Operator-specific defaults are forbidden; tenant-authored content may be tenant-specific while preserving required platform identity.
- Configuration applies to instances of registered capabilities; new capability types require extension registration.

## 6. Topological Component Catalog

| ID | Component | Type | Required dependencies | Optional dependencies | Owned data / authority | Emits | Consumes | Activation / lifecycle | Billing / evidence impact |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 6E.01 | Campaign Audience and Suppression Service | Candidate tenant service | 6B.04, 6B.06, 6B.08, 6C.08, 6D.02, 6A.11 | None | Segments, suppression lists, audience snapshots, consent references | audience.created, suppression.applied | lead.created, student.created, event_lead.created, optout.recorded | Foundry-managed; opt-out enforced by gateway | Audience/segment evidence |
| 6E.02 | Email, WhatsApp, SMS, Push Campaign Service | Candidate service with optional channel micro-services | 6E.01, 6A.11, 6A.13 | Provider extensions | Campaign definitions, templates, schedules, sends, per-recipient status | campaign.scheduled, campaign.sent, campaign.paused, campaign.completed | audience.created, communication.sent, communication.blocked | Optional channels toggleable; gateway mandatory | Billable communication evidence |
| 6E.03 | Meta Ads and Attribution Service | Candidate optional service | 6E.01, 6B.04, 6B.08 | Meta/ad provider extensions | Ad account links, campaign metadata, UTM mappings, attribution chains | ad_campaign.synced, attribution.recorded | lead.created, campaign.sent | Optional; provider failure degrades to manual attribution | Ad/attribution evidence |
| 6E.04 | Automation Sequences and Campaign Analytics | Candidate service cluster | 6E.02, 6E.03, 6A.15 | None | Sequence definitions, A/B tests, analytics, ROI views | sequence.started, sequence.exited, campaign.report_generated | campaign.sent, attribution.recorded | Foundry-managed; human-approved sends where required | Report/optimization evidence |
| 6E.05 | E-Commerce Storefront and Product Discovery | Candidate tenant service | 6B.01, 6B.02, 6B.03, 6B.09, 6B.10 | 6E.04 campaigns as soft marketing dependency | Stores, collections, storefront settings, reviews, product listing configuration | store.created, product_viewed, cart.started | product.created, stock.moved | Foundry-managed; store optional by tenant/package | Storefront/product-view evidence |
| 6E.06 | Cart, Checkout, Orders, Fulfilment, Shipping, Returns | Candidate service cluster | 6E.05, 6B.10, 6B.12, 6B.13 | Carrier/3PL/payment extensions | Carts, orders, order lines, reservations, fulfilment, shipments, returns, refunds | order.placed, inventory.reserved, order.fulfilled, return.requested | payment.verified, stock.reserved | Foundry-managed; order flow Saga-based | Order/transaction/shipping evidence |
| 6E.07 | Marketplace and E-Commerce Analytics | Candidate optional service | 6E.06, 6B.11, 6B.12 | Vendor payout extensions | Vendor profiles, commissions, payouts, disputes, sales analytics | vendor.onboarded, payout.generated, ecommerce.report_generated | order.fulfilled, journal.posted | Optional; not required for single-seller storefront | Marketplace/report evidence |
| 6E.08 | Website and App Builder Core | Candidate tenant service | 6A.18, 6B.01, 6C.08, 6D.02 | 6E.05 E-Commerce blocks, 6E.02 campaign forms | Sites, pages, sections, blocks, themes, drafts, versions | site.created, page.published, block.connected | product.created, event.created, student.created | Foundry-managed; platform identity required on published surfaces | Page/publish/storage evidence |
| 6E.09 | Forms, SEO, Blog, Multi-Site, PWA, Connected Blocks | Candidate service/micro-service cluster | 6E.08, 6A.13, 6A.11 | 6E.05 store blocks, 6E.02 lead capture campaigns | Forms, SEO metadata, redirects, blog posts, PWA settings, connected block configs | form_lead.submitted, seo.updated, blog.published, pwa.enabled | page.published, form.submitted | Optional capabilities depending package | Form/page/app evidence |

## 7. Microscopic Component Scope

### 6E.01 — Campaign Audience and Suppression Service

**Microscopic scope:**

- Builds dynamic and snapshot audiences from earlier operational modules through registered fields and evidence.
- Suppression lists and global opt-out are enforced before campaign sends.
- Audience segmentation supports AND/OR/NOT filters and data-source transparency.
- Audience creation never grants cross-tenant access.
- Campaigns consume CRM/Events/LMS/Finance evidence but do not own those records.

### 6E.02 — Email, WhatsApp, SMS, Push Campaign Service

**Microscopic scope:**

- Campaign sends are channel-specific optional micro-services with their own price references.
- All sends route through Communication Gateway and opt-out enforcement.
- Templates are versioned and externalised; tenant-authored copy may contain tenant branding.
- Send scheduling respects quiet hours and recipient locale/timezone where configured.
- Per-recipient send status feeds evidence and analytics.

### 6E.03 — Meta Ads and Attribution Service

**Microscopic scope:**

- Ad provider integration is optional and extension-driven.
- Lead attribution links campaign/ad metadata to CRM leads and conversions.
- UTM and source tracking are data-driven and auditable.
- Provider failure does not block CRM or campaign basics.
- Attribution evidence can feed optimization and later AI Business Consultant.

### 6E.04 — Automation Sequences and Campaign Analytics

**Microscopic scope:**

- Multi-channel sequences compose registered workflow actions only.
- Sequences pause on replies and observe opt-out rules.
- A/B tests, funnel analytics, ROI, comparison reports, and attribution reporting are evidence-backed.
- Optimization hooks identify expensive/low-converting campaigns and underused channels.
- AI-generated campaign actions remain recommendations unless separately approved by a human.

### 6E.05 — E-Commerce Storefront and Product Discovery

**Microscopic scope:**

- Uses Products/Catalogue as product authority; E-Commerce does not duplicate product master data.
- Storefronts may be tenant-branded while retaining required platform identity.
- Product listings, collections, reviews, Q&A, recommendations, and search/filter configuration are tenant-configured.
- Inventory visibility consumes Inventory evidence where active.
- Campaigns are a soft dependency for marketing, not a hard dependency for storefront function.

### 6E.06 — Cart, Checkout, Orders, Fulfilment, Shipping, Returns

**Microscopic scope:**

- Order flow is a Saga: cart/order → payment → inventory reservation → fulfilment → shipment/return/refund.
- Payment uses Finance payment services and provider idempotency.
- Inventory reservation consumes 6B inventory and releases holds when checkout expires.
- Shipping/carrier/3PL integrations are extensions.
- Returns/refunds use Finance correction/refund policies and preserve invoice immutability.

### 6E.07 — Marketplace and E-Commerce Analytics

**Microscopic scope:**

- Marketplace vendor onboarding is optional and depends on E-Commerce order/finance foundations.
- Vendor payouts use Finance accounting/payment evidence and configurable commission rules.
- Disputes, performance, analytics, and vendor dashboards are tenant-enabled capabilities.
- Analytics are evidence-backed, not decorative dashboards.
- Marketplace service can be omitted for single-tenant/single-seller businesses.

### 6E.08 — Website and App Builder Core

**Microscopic scope:**

- Visual editor uses base design system from 6A; advanced design polish remains 6F.
- Pages, drafts, versions, scheduling, rollback, access control, and published/draft separation are core website-builder capabilities.
- Connected blocks consume earlier modules: products, events, LMS/programmes, CRM forms, e-commerce store data where active.
- Builder operates without e-commerce, but e-commerce blocks light up when e-commerce exists.
- Published tenant surfaces may use tenant branding but must preserve required platform identity.

### 6E.09 — Forms, SEO, Blog, Multi-Site, PWA, Connected Blocks

**Microscopic scope:**

- Forms submit through Configuration Engine and route into CRM/Events/LMS according to tenant mapping.
- SEO metadata, sitemap, redirects, structured data, and blog content are tenant-controlled configuration/content.
- Multi-site and PWA features are optional micro-services/package capabilities.
- Connected blocks are soft dependencies on earlier services and must degrade gracefully if the source service is inactive.
- Spam protection, rate limits, and required platform identity apply to published surfaces.

## 8. Forward Dependency Check

PASS: 6E components depend only on 6A–6D or earlier-numbered 6E components. E-Commerce treats Campaigns as soft dependency only. Website Builder treats E-Commerce connected blocks as optional. No 6E component depends on 6F.


## Appendix A — Component Field Meaning

| Field | Meaning |
| --- | --- |
| ID | Topological order number. Later components may depend on earlier components only. |
| Component | Candidate service, micro-service cluster, core platform system, or UI/system layer. |
| Type | Boundary classification before sub-surface validation. |
| Required dependencies | Earlier components required before this one can be catalogued or built. |
| Optional dependencies | Earlier components that enhance behavior but are not required for core function. |
| Owned data / authority | Data domain or configuration authority owned by this component. |
| Emits | Conceptual events/evidence this component produces. |
| Consumes | Conceptual events/evidence this component consumes. |
| Activation / lifecycle | Foundry or lifecycle behavior. |
| Billing / evidence impact | Billing, usage, audit, or operational evidence behavior. |

## Appendix B — Sub-Surface Validation Rule

Sub-surface cataloguing MUST validate whether each proposed component should remain one service, split into multiple services, merge into an earlier service, become a core micro-service, become an optional micro-service, or defer to a later phase. This validation may change exact boundaries, but it MUST NOT violate the locked dependency order or business rules.
